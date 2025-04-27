import type { NodeEditor } from "rete";
import type { GraphJsonData, NodeJson } from "./JsonType";
import type { AreaExtra, Schemes } from "../renderer/nodeEditor/types";
import type { AreaPlugin } from "rete-area-plugin";

/**
 * editor の状態を GraphJsonData 形式にシリアライズして返す
 */
export function exportGraph(
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>
): GraphJsonData {
  // ノード情報を整形
  const nodes: NodeJson[] = [];
  for (const node of editor.getNodes()) {
    // positionとsizeを取得するために nodeViewからnodeを取得
    const _node = area.nodeViews.get(node.id);
    if (!_node) {
      console.error(`Node with id ${node.id} not found in area.`);
      continue;
    }

    // sizeを取得するためelementを取得
    const element = _node.element.querySelector("*:not(span):not([fragment])");
    if (!element || !(element instanceof HTMLElement)) {
      console.error(`Element for node with id ${node.id} not found.`);
      continue;
    }
    const rect = element.getBoundingClientRect();

    const baseData = {
      id: node.id,
      type: node.label,
      position: { x: _node.position.x, y: _node.position.y },
      size: { width: rect.width, height: rect.height },
    };

    const nodeData = node.toJSON();

    nodes.push({
      ...baseData,
      ...nodeData,
    });
  }

  // コネクション情報を整形
  const connections = editor.getConnections().map((conn) => ({
    id: conn.id,
    source: conn.source,
    sourcePort: conn.sourceOutput,
    target: conn.target,
    targetPort: conn.targetInput,
  }));

  return {
    version: "1.0", // バージョン情報
    nodes,
    connections,
  };
}
