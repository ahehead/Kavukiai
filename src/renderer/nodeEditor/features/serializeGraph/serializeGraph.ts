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
    const nodeJson = convertNodeToJson(node, area);
    if (nodeJson) {
      nodes.push(nodeJson);
    }
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

/**
 * 指定したノード集合と、その間のみの接続を GraphJsonData にシリアライズして返す
 */
export function serializeSubgraph(
  nodes: NodeTypes[],
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>
): GraphJsonData {
  // ノードIDのセットを用意
  const nodeIdSet = new Set(nodes.map((n) => n.id));

  // ノード情報を整形（与えられたノードのみ）
  const nodeJsonList: NodeJson[] = [];
  for (const node of nodes) {
    const nodeJson = convertNodeToJson(node, area);
    if (nodeJson) nodeJsonList.push(nodeJson);
  }

  // コネクションは両端がセット内のノードに限る
  const connections = editor
    .getConnections()
    .filter((conn) => nodeIdSet.has(conn.source) && nodeIdSet.has(conn.target))
    .map((conn) => ({
      id: conn.id,
      source: conn.source,
      sourcePort: conn.sourceOutput,
      target: conn.target,
      targetPort: conn.targetInput,
    }));

  return {
    version: "1.0",
    nodes: nodeJsonList,
    connections,
  };
}

/**
 * ノードを NodeJson 形式に変換する
 */
function convertNodeToJson(
  node: NodeTypes,
  area: AreaPlugin<Schemes, AreaExtra>
): NodeJson | null {
  // positionを取得するために nodeViewからnodeを取得
  const nodeView = area.nodeViews.get(node.id);
  if (!nodeView) {
    console.error(`Node with id ${node.id} not found in area.`);
    return null;
  }

  let nodeData = {};
  if ("serializeControlValue" in node) {
    nodeData = node.serializeControlValue();
  }

  let inputsData = {};
  if ("serializeInputs" in node) {
    inputsData = node.serializeInputs();
  }

  return {
    ...buildNodeBaseData(node, nodeView),
    ...nodeData,
    ...inputsData,
  };
}

function buildNodeBaseData(node: NodeTypes, nodeView: NodeView): NodeJson {
  return {
    id: node.id,
    type: node.label,
    position: { x: nodeView.position.x, y: nodeView.position.y },
    size: { width: node.width, height: node.height },
  };
}
