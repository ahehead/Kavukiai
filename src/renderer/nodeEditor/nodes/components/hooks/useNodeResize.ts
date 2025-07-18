// New hook for node resizing logic
import { useCallback } from "react";
import type { AreaPlugin } from "rete-area-plugin";
import type { HistoryAction, HistoryPlugin } from "rete-history-plugin";
import type { AreaExtra, NodeInterface, Schemes } from "../../../types/Schemes";

const nodeMinWidth = 220;
const nodeMinHeight = 100;

class SizeChangeHistory implements HistoryAction {
  constructor(
    private node: NodeInterface,
    private area: AreaPlugin<Schemes, AreaExtra>,
    private prev: { width: number; height: number },
    private next: { width: number; height: number }
  ) {}
  async undo() {
    this.node.setSize(this.prev.width, this.prev.height);
    await this.area.resize(this.node.id, this.prev.width, this.prev.height);
  }
  async redo() {
    this.node.setSize(this.next.width, this.next.height);
    await this.area.resize(this.node.id, this.next.width, this.next.height);
  }
}

// History action for clearing node size
class ClearSizeHistoryAction implements HistoryAction {
  private prev: Size;

  constructor(
    private node: NodeInterface,
    private area: AreaPlugin<Schemes, AreaExtra>
  ) {
    // 保存: クリア前のサイズ
    this.prev = this.node.getSize();
  }

  async undo() {
    const { width, height } = this.prev;
    if (width !== undefined && height !== undefined) {
      this.node.setSize(width, height);
      await this.area.resize(this.node.id, width, height);
    }
  }

  async redo() {
    this.node.clearSize();
    await this.area.update("node", this.node.id); // リサイズではなく再レンダリング
  }
}

// Utility type for node sizes
type Size = { width?: number; height?: number };

type UseNodeResizeProps = {
  node: NodeInterface;
  area: AreaPlugin<Schemes, AreaExtra>;
  history: HistoryPlugin<Schemes>;
  getZoom: () => number;
  panelRef: React.RefObject<HTMLDivElement | null>;
};

export function useNodeResize({
  node,
  area,
  history,
  getZoom,
  panelRef,
}: UseNodeResizeProps) {
  const getPanelSize = useCallback((): { width: number; height: number } => {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      const zoom = getZoom();
      return { width: rect.width / zoom, height: rect.height / zoom };
    }
    return {
      width: node.width ?? nodeMinWidth,
      height: node.height ?? nodeMinHeight,
    };
  }, [panelRef, getZoom, node]);

  const startResize = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      // pointer capture for robust resizing
      const target = e.currentTarget as Element;
      target.setPointerCapture(e.pointerId);
      const { width: startW, height: startH } = getPanelSize();
      const startX = e.clientX;
      const startY = e.clientY;
      const zoom = getZoom();

      async function move(event: PointerEvent) {
        const dx = (event.clientX - startX) / zoom;
        const dy = (event.clientY - startY) / zoom;
        const newWidth = Math.max(startW + dx, nodeMinWidth);
        const newHeight = Math.max(startH + dy, nodeMinHeight);
        node.setSize(newWidth, newHeight);
        await area.resize(node.id, newWidth, newHeight);
      }

      function up() {
        // release pointer capture
        target.releasePointerCapture(e.pointerId);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        const { width, height } = node.getSize();
        // width または height が undefined の場合は履歴に追加しない
        if (width === undefined || height === undefined) return;
        if (startW !== width || startH !== height) {
          // Only add to history if size actually changed
          history.add(
            new SizeChangeHistory(
              node,
              area,
              { width: startW, height: startH },
              { width: width, height: height }
            )
          );
        }
      }

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [getPanelSize, getZoom, node, area, history]
  );

  // ノードサイズをクリアする関数を追加
  const clearNodeSize = useCallback(async () => {
    const { width: currentWidth, height: currentHeight } = node.getSize();

    // サイズが既にクリアされている場合は何もしない
    if (currentWidth === undefined && currentHeight === undefined) return;

    // サイズが設定されている場合のみ履歴に追加
    if (currentWidth !== undefined || currentHeight !== undefined) {
      history.add(new ClearSizeHistoryAction(node, area));
    }

    node.clearSize();
    await area.update("node", node.id); // area.update を呼び出して再レンダリングをトリガー
  }, [node, area, history]);

  return {
    startResize,
    clearNodeSize, // clearNodeSize を返す
    nodeMinWidth,
    nodeMinHeight,
  };
}
