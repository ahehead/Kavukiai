// Group model (no dependency on Rete Area APIs)
import type { NodeId } from "rete";

export const MIN_GROUP_WIDTH = 120;
export const MIN_GROUP_HEIGHT = 80;

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
