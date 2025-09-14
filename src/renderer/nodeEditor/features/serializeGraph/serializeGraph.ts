import { getNodePosition } from "renderer/nodeEditor/nodes/util/getNodePosition";
import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type {
  ConnectionJson,
  GraphJsonData,
  NodeJson,
} from "../../../../shared/JsonType";
import type { AreaExtra, NodeTypes, Schemes } from "../../types/ReteSchemes";
import type { Group, GroupPlugin } from "../group";

/**
 * editor の状態を GraphJsonData 形式にシリアライズして返す
 */
export function serializeGraph(
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>,
  group: GroupPlugin<Schemes>
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
    groups: group.toJson(),
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
  if (
    "serializeControlValue" in node &&
    typeof node.serializeControlValue === "function"
  ) {
    nodeData = node.serializeControlValue();
  }

  let inputsData = {};
  if ("serializeInputs" in node && typeof node.serializeInputs === "function") {
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
    // 保存時は安定ID（namespace:name）を書く
    type: (node as any).typeId ?? (node as any).label,
    position: { x: position.x, y: position.y },
    size: { width: node.width, height: node.height },
  };
}

/**
 * 右クリックコピー用に、対象ノードとグループをそのままJSONにして返す
 * - 位置は相対変換しない（絶対位置のまま）
 * - 接続は対象ノード間のみを含める
 */
export function buildGraphJsonForCopy(
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>,
  targetNodes: NodeTypes[],
  groups?: Group[]
): GraphJsonData {
  return {
    version: "1.0",
    nodes: targetNodes
      .map((n) => convertNodeToJson(n, area))
      .filter((n) => n !== null),
    connections: getConnectionsForNodes(targetNodes, editor),
    metadata: {
      createdAt: new Date().toISOString(),
    },
    groups: groups?.map((group) => group.toJson()),
  };
}
