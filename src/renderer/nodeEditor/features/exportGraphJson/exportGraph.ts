import type { NodeEditor } from "rete";
import type { GraphJsonData, NodeJson } from "../../../../shared/JsonType";
import type { AreaExtra, Schemes } from "../../types";
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
    // positionを取得するために nodeViewからnodeを取得
    const _node = area.nodeViews.get(node.id);
    if (!_node) {
      console.error(`Node with id ${node.id} not found in area.`);
      continue;
    }

    const baseData = {
      id: node.id,
      type: node.label,
      position: { x: _node.position.x, y: _node.position.y },
      size: { width: node.width, height: node.height },
    };

    let nodeData = {};
    if (typeof (node as any).toJSON === "function") {
      nodeData = (node as any).toJSON();
    }
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
