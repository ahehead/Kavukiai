// Group model (no dependency on Rete Area APIs)
import type { NodeId } from "rete";
import type { GroupJson } from "shared/JsonType";

export const MIN_GROUP_WIDTH = 120;
export const MIN_GROUP_HEIGHT = 80;

export type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export class Group {
  id: string = crypto.randomUUID();
  // text は getter/setter 経由で更新通知を行う
  private _text = "";
  links: NodeId[] = [];
  // 常に定義済みの矩形（linksが空なら最小サイズ、位置は保持）
  rect: Rect = {
    left: 0,
    top: 0,
    width: MIN_GROUP_WIDTH,
    height: MIN_GROUP_HEIGHT,
  };
  element!: HTMLElement;
  // mountElement で付与するイベントリスナー参照（destroy 時に外す）
  onPointerDown?: (e: PointerEvent) => void;
  onPointerMove?: (e: PointerEvent) => void;
  onPointerUp?: (e: PointerEvent) => void;
  onContextMenu?: (e: MouseEvent) => void;
  // 外部購読者
  private listeners = new Set<() => void>();

  constructor(text: string) {
    this._text = text;
  }
  linkedTo(id: NodeId) {
    return this.links.includes(id);
  }
  linkTo(ids: NodeId[]) {
    // 重複排除して順序を維持
    const next = Array.from(new Set(ids));
    const changed =
      next.length !== this.links.length ||
      next.some((v, i) => v !== this.links[i]);
    this.links = next;
    if (changed) this.notify();
  }

  // --- link helpers ---
  /** 単一ノードをリンクへ追加（既に含まれていれば何もしない） */
  addLink(id: NodeId) {
    if (this.links.includes(id)) return;
    this.links = [...this.links, id];
    this.notify();
  }

  /** 複数ノードをリンクへ追加（重複は自動的に排除） */
  addLinks(ids: NodeId[]) {
    this.linkTo([...this.links, ...ids]);
  }

  /** 単一ノードをリンクから除去（存在しなければ何もしない） */
  removeLink(id: NodeId) {
    if (!this.links.includes(id)) return;
    this.links = this.links.filter((x) => x !== id);
    this.notify();
  }

  /** 複数ノードをリンクから除去 */
  removeLinks(ids: NodeId[]) {
    if (ids.length === 0) return;
    const s = new Set(ids);
    const next = this.links.filter((x) => !s.has(x));
    if (next.length === this.links.length) return;
    this.links = next;
    this.notify();
  }

  /** すべてのリンクを解除 */
  clearLinks() {
    if (this.links.length === 0) return;
    this.links = [];
    this.notify();
  }

  // --- text accessor with notify ---
  get text(): string {
    return this._text;
  }
  set text(v: string) {
    if (v === this._text) return;
    this._text = v;
    this.notify();
  }

  // --- rect updater (set all at once) ---
  updateRect(next: Rect) {
    const r = this.rect;
    const changed =
      r.left !== next.left ||
      r.top !== next.top ||
      r.width !== next.width ||
      r.height !== next.height;
    this.rect = next;
    if (changed) this.notify();
  }

  // --- subscribe/notify for useSyncExternalStore ---
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private notify() {
    // 例外防止にコピーを走査
    for (const l of Array.from(this.listeners)) {
      try {
        l();
      } catch {
        // no-op
      }
    }
  }

  // --- JSON serialization ---
  toJson(): GroupJson {
    return {
      id: this.id,
      text: this.text,
      rect: {
        left: this.rect.left,
        top: this.rect.top,
        width: this.rect.width,
        height: this.rect.height,
      },
      links: [...this.links],
    };
  }

  static fromJson(j: GroupJson): Group {
    const g = new Group(j.text);
    g.id = j.id;
    // 重複排除して順序維持
    const nextLinks = Array.from(new Set(j.links)) as NodeId[];
    g.linkTo(nextLinks);
    const { width, height } = clampGroupRectWidthHeight(
      j.rect.width,
      j.rect.height
    );
    g.updateRect({
      left: j.rect.left,
      top: j.rect.top,
      width,
      height,
    });
    return g;
  }
}

// ----- JSON helpers -----
function clampGroupRectWidthHeight(width: number, height: number) {
  return {
    width: Math.max(MIN_GROUP_WIDTH, width),
    height: Math.max(MIN_GROUP_HEIGHT, height),
  };
}

export interface GroupSerializable {
  toJson(): GroupJson;
}
