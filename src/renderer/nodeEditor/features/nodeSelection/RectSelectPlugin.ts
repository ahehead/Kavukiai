import { type NodeEditor, type Root, Scope } from "rete";
import {
  type Area2D,
  AreaPlugin,
  type BaseArea,
  type NodeView,
} from "rete-area-plugin";
import type { AreaExtra, Schemes } from "../../types";
import type { selectableNodes } from "./selectable";

type Point = { x: number; y: number };

export class RectSelectPlugin extends Scope<
  AreaPlugin<Schemes, AreaExtra>,
  [Area2D<Schemes>, Root<Schemes>]
> {
  private area!: AreaPlugin<Schemes, AreaExtra>;
  private editor: NodeEditor<Schemes>;
  private container: HTMLElement;
  private getZoom: () => number;
  private selectableNodes: ReturnType<typeof selectableNodes> | null = null;
  private isDragging = false;
  private startPoint: Point = { x: 0, y: 0 };

  private overlayElement: HTMLDivElement | null = null;
  private rectElement: HTMLDivElement | null = null;
  private diff = 320000; // オーバーレイの大きさを調整

  constructor(options: {
    editor: NodeEditor<Schemes>;
    container: HTMLElement;
    getZoom: () => number;
    selectableNodes: ReturnType<typeof selectableNodes> | null;
  }) {
    super("node-selection-plugin");
    this.editor = options.editor;
    this.container = options.container;
    this.getZoom = options.getZoom;
    this.selectableNodes = options.selectableNodes;
  }

  setParent(scope: Scope<BaseArea<Schemes>, [Root<Schemes>]>) {
    super.setParent(scope);
    this.area = this.parentScope<AreaPlugin<Schemes, AreaExtra>>(AreaPlugin);

    this.addPipe((context) => {
      if (!context || typeof context !== "object" || !("type" in context))
        return context;

      if (context.type === "pointerdown") {
        // マウス中ボタンと、右クリックとかを無視
        if (context.data.event.button !== 0) return context;
        // 右クリックメニューをクリックした場合は無視
        const target = context.data.event.target as HTMLElement;
        if (target.getAttribute("data-testid") === "context-menu-item")
          return context;
        // console.debug("Pointer down, rect select start", context);
        this.isDragging = true;
        this.startPoint = {
          x: context.data.position.x,
          y: context.data.position.y,
        };
        if (!context.data.event.shiftKey) {
          this.clearSelectedNodes();
        }
        // 1) 全体を覆うオーバーレイを生成
        if (!this.overlayElement) {
          this.overlayElement = document.createElement("div");
          Object.assign(this.overlayElement.style, {
            position: "absolute",
            left: `-${this.diff}px`,
            top: `-${this.diff}px`,
            width: `${this.diff * 2}px`,
            height: `${this.diff * 2}px`,
            zIndex: "60", // 必要に応じて調整
            pointerEvents: "all", // 全イベントをキャッチ
          });
          this.container.firstElementChild?.appendChild(this.overlayElement);
        }

        // 2) オーバーレイ上に選択矩形を生成
        if (!this.rectElement && this.overlayElement) {
          this.rectElement = document.createElement("div");
          const borderSize = 1 / this.getZoom();
          this.rectElement.classList.add(
            "absolute",
            "border-dashed",
            "bg-transparent"
          );
          this.rectElement.style.borderWidth = `${borderSize}px`;
          // 矩形もイベントキャッチ（ドラッグ操作継続のため）
          this.rectElement.style.pointerEvents = "all";
          this.overlayElement.appendChild(this.rectElement);
        }
      }

      if (
        context.type === "pointermove" &&
        this.isDragging &&
        this.rectElement
      ) {
        const end = { x: context.data.position.x, y: context.data.position.y };
        const l = Math.min(this.startPoint.x, end.x);
        const t = Math.min(this.startPoint.y, end.y);
        const w = Math.abs(end.x - this.startPoint.x);
        const h = Math.abs(end.y - this.startPoint.y);
        Object.assign(this.rectElement.style, {
          left: `${l + this.diff}px`,
          top: `${t + this.diff}px`,
          width: `${w}px`,
          height: `${h}px`,
        });
      }

      if (context.type === "pointerup" && this.isDragging) {
        // console.debug("Pointer up, rect select end");
        this.isDragging = false;
        const endPoint: Point = {
          x: context.data.position.x,
          y: context.data.position.y,
        };
        const selectedNodes = this.filterNodesInArea(
          this.startPoint,
          endPoint,
          this.getZoom()
        );
        for (const node of selectedNodes) {
          this.selectableNodes?.select(node.id, true);
        }
        this.startPoint = { x: 0, y: 0 };
        if (this.overlayElement) {
          this.overlayElement.remove();
          this.overlayElement = null;
          this.rectElement = null;
        }
      }

      return context;
    });
  }

  private clearSelectedNodes() {
    const nodes = this.editor.getNodes().filter((node) => node.selected);
    for (const node of nodes) {
      this.selectableNodes?.unselect(node.id);
    }
  }

  private filterNodesInArea(startPoint: Point, endPoint: Point, zoom: number) {
    const nodes = this.editor.getNodes();
    // start/end を正規化して左上 (x1,y1)、右下 (x2,y2) を算出
    const x1 = Math.min(startPoint.x, endPoint.x);
    const x2 = Math.max(startPoint.x, endPoint.x);
    const y1 = Math.min(startPoint.y, endPoint.y);
    const y2 = Math.max(startPoint.y, endPoint.y);
    return nodes.filter((node) => {
      const nodeView = this.area.nodeViews.get(node.id);
      if (!nodeView) return false;
      const left = nodeView.position.x;
      const top = nodeView.position.y;
      const { width, height } = this.getSize(node, nodeView, zoom);
      const right = left + (width || 0);
      const bottom = top + (height || 0);

      // 矩形同士のオーバーラップ判定
      return left < x2 && right > x1 && top < y2 && bottom > y1;
    });
  }

  getSize(node: Schemes["Node"], nodeView: NodeView, zoom: number) {
    const { width, height } = node.getSize();
    if (width && height) {
      return { width, height };
    }
    const rect = nodeView.element.getBoundingClientRect();
    return { width: rect.width / zoom, height: rect.height / zoom };
  }

  destroy() {
    this.clearSelectedNodes();
    if (this.overlayElement) {
      this.overlayElement.remove();
      this.overlayElement = null;
      this.rectElement = null;
    }
    this.isDragging = false;
    this.startPoint = { x: 0, y: 0 };
  }
}
