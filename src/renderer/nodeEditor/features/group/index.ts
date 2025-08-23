// Minimal Group/Comment plugin (auto-size, no node-model x/y dependency)
import { type BaseSchemes, NodeEditor, type NodeId, Scope } from "rete";
import { type BaseArea, BaseAreaPlugin } from "rete-area-plugin";

type Produces =
  | { type: "groupcreated"; data: Group }
  | { type: "groupremoved"; data: Group }
  | {
      type: "grouptranslated";
      data: { id: string; dx: number; dy: number; sources?: NodeId[] };
    };

export class Group {
  id = crypto.randomUUID();
  text = "";
  links: NodeId[] = [];
  // undefined なら「AUTO（リンクノードの外接矩形）」にする
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  selected = false;
  element!: HTMLElement;

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
  private area!: BaseAreaPlugin<Schemes, BaseArea<Schemes>>;
  private editor!: NodeEditor<Schemes>;
  public groups = new Map<string, Group>();

  constructor() {
    super("group");
  }

  setParent(scope: Scope<BaseArea<Schemes>>) {
    super.setParent(scope);
    this.area =
      this.parentScope<BaseAreaPlugin<Schemes, BaseArea<Schemes>>>(
        BaseAreaPlugin
      );
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

      if (ctx.type === "nodetranslated") {
        const { id, position, previous } = ctx.data;
        const dx = position.x - previous.x;
        const dy = position.y - previous.y;
        for (const g of this.groups.values()) {
          if (g.links.includes(id)) {
            // AUTO サイズならフレームは動かさず resize、固定ならフレームも追従
            if (g.x == null || g.y == null || g.w == null || g.h == null) {
              this.resize(g);
            } else {
              this.translateGroup(g.id, dx, dy, [id]);
            }
          }
        }
      }

      if (ctx.type === "nodedragged") {
        const { id } = ctx.data;
        for (const g of this.groups.values()) {
          // 入出の度にリンク集合を更新
          const inside = this.intersects(g, id);
          const links = g.links.filter((n) => n !== id);
          g.linkTo(inside ? [...links, id] : links);
          if (g.x == null || g.y == null || g.w == null || g.h == null)
            this.resize(g);
        }
      }

      if (ctx.type === "reordered") {
        // ノードの z 順が変わったらフレーム DOM を前面へ
        const el = (ctx as any).data.element as HTMLElement;
        for (const g of this.groups.values()) {
          if (g.element && el.parentElement) {
            el.parentElement.insertBefore(
              g.element,
              el.parentElement.firstChild
            );
          }
        }
      }

      if (ctx.type === "grouptranslated") {
        const { id, dx, dy, sources } = ctx.data;
        const g = this.groups.get(id);
        if (!g) return ctx;
        for (const linkId of g.links) {
          if (sources?.includes(linkId)) continue;
          const v = this.area.nodeViews.get(linkId);
          if (!v || isTranslating(linkId)) continue;
          void translate(linkId, v.position.x + dx, v.position.y + dy);
        }
      }
      return ctx;
    });

    // --- Editor signals
    this.editor.addPipe((ctx) => {
      if (ctx.type === "noderemoved") {
        const { id } = ctx.data;
        for (const g of this.groups.values())
          g.linkTo(g.links.filter((x) => x !== id));
      }
      return ctx;
    });
  }

  // Public API
  addGroup(
    text: string,
    links: NodeId[] = [],
    rect?: { x?: number; y?: number; w?: number; h?: number }
  ) {
    const g = new Group(text);
    g.linkTo(links);
    Object.assign(g, rect);
    this.mountElement(g);
    this.groups.set(g.id, g);
    this.resize(g);
    void this.emit({ type: "groupcreated", data: g });
    return g;
  }

  delete(id: string) {
    const g = this.groups.get(id);
    if (!g) return;
    g.element.remove();
    this.groups.delete(id);
    void this.emit({ type: "groupremoved", data: g });
  }

  translateGroup(id: string, dx: number, dy: number, sources?: NodeId[]) {
    const g = this.groups.get(id);
    if (!g) return;
    if (g.x != null) g.x += dx;
    if (g.y != null) g.y += dy;
    this.applyRect(g);
    void this.emit({ type: "grouptranslated", data: { id, dx, dy, sources } });
  }

  // ---- geometry helpers (view-based; never use model x/y)
  private nodeRect(id: NodeId) {
    const v = this.area.nodeViews.get(id);
    if (!v) return null;
    const { x, y } = v.position;
    const r = (v.element as HTMLElement).getBoundingClientRect();
    return { x, y, w: r.width, h: r.height };
  }

  private resize(g: Group) {
    // AUTO: links の外接矩形 + padding
    const recs = g.links.map((id) => this.nodeRect(id)).filter(Boolean) as {
      x: number;
      y: number;
      w: number;
      h: number;
    }[];
    if (!recs.length) return;
    const pad = 12;
    const minX = Math.min(...recs.map((r) => r.x));
    const minY = Math.min(...recs.map((r) => r.y));
    const maxX = Math.max(...recs.map((r) => r.x + r.w));
    const maxY = Math.max(...recs.map((r) => r.y + r.h));
    if (g.x == null) g.x = minX - pad;
    if (g.y == null) g.y = minY - pad;
    if (g.w == null) g.w = maxX - minX + pad * 2;
    if (g.h == null) g.h = maxY - minY + pad * 2;
    this.applyRect(g);
  }

  private intersects(g: Group, nodeId: NodeId) {
    const r = this.nodeRect(nodeId);
    if (!r || g.x == null || g.y == null || g.w == null || g.h == null)
      return false;
    const gx = g.x,
      gy = g.y,
      gw = g.w,
      gh = g.h;
    return !(
      r.x > gx + gw ||
      r.x + r.w < gx ||
      r.y > gy + gh ||
      r.y + r.h < gy
    );
  }

  private applyRect(g: Group) {
    const el = g.element;
    if (!el || g.x == null || g.y == null || g.w == null || g.h == null) return;
    el.style.transform = `translate(${g.x}px, ${g.y}px)`;
    el.style.width = `${g.w}px`;
    el.style.height = `${g.h}px`;
  }

  private mountElement(g: Group) {
    const el = document.createElement("div");
    el.className = "rete-group";
    el.innerHTML = `<div class="rete-group-title">${g.text}</div>`;
    // ドラッグでグループを動かす（dx,dy を emit）
    let sx = 0,
      sy = 0;
    el.addEventListener("pointerdown", (e) => {
      sx = e.clientX;
      sy = e.clientY;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    });
    el.addEventListener("pointermove", (e) => {
      if (!(e.buttons & 1)) return;
      const dx = e.clientX - sx,
        dy = e.clientY - sy;
      sx = e.clientX;
      sy = e.clientY;
      this.translateGroup(g.id, dx, dy);
    });
    this.area.area.content.add(el); // Area の content レイヤに載せる
    g.element = el;
  }
}
