// Minimal Group/Comment plugin (auto-size, no node-model x/y dependency)
import type { AreaExtra } from "renderer/nodeEditor/types";
import { type BaseSchemes, NodeEditor, type NodeId, Scope } from "rete";
import { AreaExtensions, AreaPlugin, type BaseArea } from "rete-area-plugin";

const DEFAULT_PADDING = 12;
// タイトル分の上方向の余白を追加（上だけ少し広めに）
const EXTRA_TOP_PADDING = 24;
const MIN_GROUP_WIDTH = 120;
const MIN_GROUP_HEIGHT = 80;

type Produces =
  | { type: "groupcreated"; data: Group }
  | { type: "groupremoved"; data: Group }
  | {
      type: "grouptranslated";
      data: { id: string; dx: number; dy: number; sources?: NodeId[] };
    }
  | {
      // グループがクリック（pointerdown）されたことを通知
      type: "grouppointerdown";
      data: { group: Group; position: { x: number; y: number } };
    };

export class Group {
  id = crypto.randomUUID();
  text = "";
  links: NodeId[] = [];
  // 常に定義済みの矩形（linksが空なら最小サイズ、位置は保持）
  left: number = 0;
  top: number = 0;
  width: number = MIN_GROUP_WIDTH;
  height: number = MIN_GROUP_HEIGHT;
  selected = false;
  element!: HTMLElement;
  // mountElement で付与するイベントリスナー参照（destroy 時に外す）
  onPointerDown?: (e: PointerEvent) => void;
  onPointerMove?: (e: PointerEvent) => void;

  constructor(text: string) {
    this.text = text;
  }
  linkedTo(id: NodeId) {
    return this.links.includes(id);
  }
  linkTo(ids: NodeId[]) {
    this.links = Array.from(new Set(ids));
  }
}

export class GroupPlugin<Schemes extends BaseSchemes> extends Scope<
  Produces,
  [BaseArea<Schemes>]
> {
  private area!: AreaPlugin<Schemes, AreaExtra>;
  private editor!: NodeEditor<Schemes>;
  public groups = new Map<string, Group>();

  constructor() {
    super("group");
  }

  setParent(scope: Scope<BaseArea<Schemes>>) {
    super.setParent(scope);
    this.area = this.parentScope<AreaPlugin<Schemes, AreaExtra>>(AreaPlugin);
    this.editor = this.area.parentScope<NodeEditor<Schemes>>(NodeEditor);

    const translating = new Set<NodeId>();
    const translate = async (id: NodeId, x: number, y: number) => {
      translating.add(id);
      const view = this.area.nodeViews.get(id);
      if (view) await this.area.translate(id, { x, y });
      translating.delete(id);
    };
    const isTranslating = (id: NodeId) => translating.has(id);

    // --- Area signals
    this.addPipe((ctx) => {
      if (!ctx || typeof ctx !== "object" || !("type" in ctx)) return ctx;

      if (ctx.type === "nodedragged") {
        const { id } = ctx.data;
        for (const g of this.groups.values()) {
          // 入出の度にリンク集合を更新し、対象ノードがリンク内なら bbox に合わせてフィット（拡大・縮小）
          const wasLinked = g.linkedTo(id);
          const inside = this.intersects(g, id);

          let membershipChanged = false;
          if (wasLinked !== inside) {
            const next = inside
              ? Array.from(new Set([...g.links, id]))
              : g.links.filter((n) => n !== id);
            g.linkTo(next);
            membershipChanged = true; // リンク集合の変化（入出）
          }

          // 入出があった場合、またはリンク済みノードが動いている場合にフィット
          if (membershipChanged || g.linkedTo(id)) this.fitToLinks(g);
        }
      }

      if (ctx.type === "grouptranslated") {
        const { id, dx, dy, sources } = ctx.data;
        const g = this.groups.get(id);
        if (!g) return ctx;

        if (sources?.length) {
          return ctx;
        }

        for (const linkId of g.links) {
          if (sources?.includes(linkId)) continue;
          const v = this.area.nodeViews.get(linkId);
          if (!v || isTranslating(linkId)) continue;
          void translate(linkId, v.position.x + dx, v.position.y + dy);
        }
      }

      if (ctx.type === "pointerdown") {
        const { position, event } = ctx.data as {
          position: { x: number; y: number };
          // 型定義上は任意だが、実際は PointerEvent が入っているケースが多い
          event?: PointerEvent;
        };

        // 1) DOM パス上にグループ要素が含まれているか（信頼度高め）
        if (event && typeof (event as any).composedPath === "function") {
          const path = (event as any).composedPath() as EventTarget[];
          for (const g of this.groups.values()) {
            if (g.element && path.includes(g.element)) {
              void this.emit({
                type: "grouppointerdown",
                data: { group: g, position },
              });
              return; // Area への pointerdown 伝播を止める
            }
          }
        }

        // 2) フォールバック: 幾何学的ヒットテスト（座標で判定）
        for (const g of this.groups.values()) {
          if (this.pointInGroup(g, position)) {
            void this.emit({
              type: "grouppointerdown",
              data: { group: g, position },
            });
            return; // 伝播停止
          }
        }
      }
      return ctx;
    });

    // --- Editor signals
    this.editor.addPipe((ctx) => {
      if (ctx.type === "noderemoved") {
        const { id } = ctx.data;
        for (const g of this.groups.values()) {
          g.linkTo(g.links.filter((x) => x !== id));
          // リンク集合に合わせてフィット（links が空なら最小化）
          this.fitToLinks(g);
        }
      }
      return ctx;
    });
  }

  // Public API
  addGroup(text: string, links: NodeId[] = []) {
    const g = new Group(text);
    g.linkTo(links);
    this.mountElement(g);
    this.groups.set(g.id, g);
    // 初期計算は常にfitToLinksに統一（linksが空なら最小サイズで位置維持）
    this.fitToLinks(g);
    void this.emit({ type: "groupcreated", data: g });
    return g;
  }

  delete(id: string) {
    const g = this.groups.get(id);
    if (!g) return;
    // イベントリスナーを明示的に解除
    if (g.element) {
      if (g.onPointerDown)
        g.element.removeEventListener("pointerdown", g.onPointerDown);
      if (g.onPointerMove)
        g.element.removeEventListener("pointermove", g.onPointerMove);
      g.onPointerDown = undefined;
      g.onPointerMove = undefined;
      g.element.remove();
    }
    this.groups.delete(id);
    void this.emit({ type: "groupremoved", data: g });
  }

  translateGroup(id: string, dx: number, dy: number, sources?: NodeId[]) {
    const g = this.groups.get(id);
    if (!g) return;
    g.left += dx;
    g.top += dy;
    this.applyRect(g);
    void this.emit({ type: "grouptranslated", data: { id, dx, dy, sources } });
  }

  // ---- geometry helpers (view-based; never use model x/y)
  private nodeRect(id: NodeId) {
    const view = this.area.nodeViews.get(id);
    if (!view) return null;
    const bb = AreaExtensions.getBoundingBox(this.area, [id]);
    return { x: bb.left, y: bb.top, w: bb.width, h: bb.height };
  }

  // links の bbox に完全フィット（拡大・縮小）し、links が空なら最小サイズへ
  private fitToLinks(g: Group) {
    const ids = g.links.filter((id) => this.area.nodeViews.has(id));
    if (ids.length) {
      const bb = AreaExtensions.getBoundingBox(this.area, ids);
      const pad = DEFAULT_PADDING;
      const padTop = pad + EXTRA_TOP_PADDING;
      g.left = bb.left - pad;
      g.top = bb.top - padTop;
      g.width = bb.width + pad * 2;
      g.height = bb.height + padTop + pad;
    } else {
      // links が空: 位置は維持、サイズは最小値
      g.width = MIN_GROUP_WIDTH;
      g.height = MIN_GROUP_HEIGHT;
    }
    this.applyRect(g);
  }

  private intersects(g: Group, nodeId: NodeId) {
    const r = this.nodeRect(nodeId);
    if (
      !r ||
      g.left == null ||
      g.top == null ||
      g.width == null ||
      g.height == null
    )
      return false;
    const gl = g.left,
      gt = g.top,
      gw = g.width,
      gh = g.height;
    return !(
      r.x > gl + gw ||
      r.x + r.w < gl ||
      r.y > gt + gh ||
      r.y + r.h < gt
    );
  }

  private applyRect(g: Group) {
    const el = g.element;
    if (!el) return;
    // transform は継続（DOM の left/top を使う必要はない）
    el.style.transform = `translate(${g.left}px, ${g.top}px)`;
    el.style.width = `${g.width}px`;
    el.style.height = `${g.height}px`;
  }

  private pointInGroup(g: Group, p: { x: number; y: number }): boolean {
    return (
      p.x >= g.left &&
      p.x <= g.left + g.width &&
      p.y >= g.top &&
      p.y <= g.top + g.height
    );
  }

  private mountElement(g: Group) {
    const el = document.createElement("div");
    el.className = "rete-group bg-black/20";
    el.innerHTML = `<div class="rete-group-title">${g.text}</div>`;
    el.style.position = "absolute";

    // ドラッグでグループを動かす（dx,dy を emit）
    let sx = 0,
      sy = 0;
    const onPointerDown = (e: PointerEvent) => {
      sx = e.clientX;
      sy = e.clientY;
      // ターゲットではなく currentTarget にキャプチャを設定
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!(e.buttons & 1)) return;
      // 画面座標の差分を content 座標に変換（ズーム倍率を考慮）
      const k = this.area.area.transform.k ?? 1;
      const dx = (e.clientX - sx) / k,
        dy = (e.clientY - sy) / k;
      sx = e.clientX;
      sy = e.clientY;
      // content 座標の delta をそのまま渡す（grouptranslated でも同一座標系で処理）
      this.translateGroup(g.id, dx, dy);
    };
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    // 解除用に保持
    g.onPointerDown = onPointerDown;
    g.onPointerMove = onPointerMove;
    this.area.area.content.add(el); // Area の content レイヤに載せる
    this.area.area.content.reorder(
      el,
      this.area.area.content.holder.firstChild
    ); // 一番下に
    g.element = el;
  }

  public destroy() {
    // すべてのグループ要素からイベントを外して DOM を除去
    for (const id of Array.from(this.groups.keys())) this.delete(id);
    this.groups.clear();
  }
}
