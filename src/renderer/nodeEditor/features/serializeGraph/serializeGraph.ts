import { getNodePosition } from "renderer/nodeEditor/nodes/util/getNodePosition";
import type { NodeEditor } from "rete";
import { AreaExtensions, type AreaPlugin } from "rete-area-plugin";
import type {
  ConnectionJson,
  GraphJsonData,
  NodeJson,
} from "../../../../shared/JsonType";
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

  return {
    version: "1.0", // バージョン情報
    nodes,
    connections: editor.getConnections(),
  };
}

/**
 * 指定ノード集合間の接続(ConnectionJson[])を Editor から抽出して返す
 */
export function getConnectionsForNodes(
  nodes: NodeTypes[],
  editor: NodeEditor<Schemes>
): ConnectionJson[] {
  const nodeIdSet = new Set(nodes.map((n) => n.id));
  return editor
    .getConnections()
    .filter((conn) => nodeIdSet.has(conn.source) && nodeIdSet.has(conn.target));
}

/**
 * ノードを NodeJson 形式に変換する
 */
export function convertNodeToJson(
  node: NodeTypes,
  area: AreaPlugin<Schemes, AreaExtra>
): NodeJson | null {
  // ノードの位置を取得
  const position = getNodePosition(area, node);
  if (!position) {
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
    ...buildNodeBaseData(node, position),
    ...nodeData,
    ...inputsData,
  };
}

/**
 * ノードのベース情報（id/type/position/size）を作成
 */
function buildNodeBaseData(
  node: NodeTypes,
  position: { x: number; y: number }
): NodeJson {
  return {
    id: node.id,
    type: node.label,
    position: { x: position.x, y: position.y },
    size: { width: node.width, height: node.height },
  };
}

/**
 * コピー用に GraphJsonData を生成するヘルパー
 * - 対象ノード群の boundingBox 左上を原点とした相対位置へ変換
 * - 対象ノード間の接続のみを含める
 */
export function buildGraphJsonForCopy(
  targetNodes: NodeTypes[],
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>
): GraphJsonData {
  const { left, top } = AreaExtensions.getBoundingBox(area, targetNodes);

  const jsonNodes: NodeJson[] = [];
  for (const node of targetNodes) {
    const nodeJson = convertNodeToJson(node, area);
    if (!nodeJson) continue; // 位置が取れない等の場合はスキップ
    // 相対位置へ変換
    nodeJson.position = {
      x: nodeJson.position.x - left,
      y: nodeJson.position.y - top,
    };
    jsonNodes.push(nodeJson);
  }

  return {
    version: "1.0",
    nodes: jsonNodes,
    connections: getConnectionsForNodes(targetNodes, editor),
    metadata: {
      createdAt: new Date().toISOString(),
    },
  };
}
