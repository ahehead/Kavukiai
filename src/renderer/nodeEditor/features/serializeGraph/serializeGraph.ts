import type { NodeEditor } from "rete";
import type { AreaPlugin, NodeView } from "rete-area-plugin";
import type { GraphJsonData, NodeJson } from "../../../../shared/JsonType";
import type { AreaExtra, NodeTypes, Schemes } from "../../types/Schemes";

/**
 * editor の状態を GraphJsonData 形式にシリアライズして返す
 */
export function serializeGraph(
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>
): GraphJsonData {
  // ノード情報を整形
  const nodes: NodeJson[] = [];
  for (const node of editor.getNodes()) {
    // positionを取得するために nodeViewからnodeを取得
    const nodeView = area.nodeViews.get(node.id);
    if (!nodeView) {
      console.error(`Node with id ${node.id} not found in area.`);
      continue;
    }

    const baseData = createNodeBaseData(node, nodeView);

    let nodeData = {};
    if ("serializeControlValue" in node) {
      nodeData = node.serializeControlValue();
    }

    let inputsData = {};
    if ("serializeInputs" in node) {
      inputsData = node.serializeInputs();
    }

    nodes.push({
      ...baseData,
      ...nodeData,
      ...inputsData,
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

function createNodeBaseData(node: NodeTypes, nodeView: NodeView) {
  return {
    id: node.id,
    type: node.label,
    position: { x: nodeView.position.x, y: nodeView.position.y },
    size: { width: node.width, height: node.height },
  };
}
