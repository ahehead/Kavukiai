import { deserializeGraphIntoEditor } from "renderer/nodeEditor/features/deserializeGraph/deserializeGraph";
import type { GroupPlugin } from "renderer/nodeEditor/features/group";
import type { NodeDeps } from "renderer/nodeEditor/nodes/nodeFactories";
import type { Schemes } from "renderer/nodeEditor/types";
import { getUID } from "rete";
import type { Item } from "rete-context-menu-plugin/_types/types";
import type {
  ConnectionJson,
  GraphJsonData,
  GroupJson,
  NodeJson,
} from "../../../../../../shared/JsonType";

export function createPasteItem(
  pointerPosition: { x: number; y: number },
  nodeDeps: NodeDeps,
  groupPlugin: GroupPlugin<Schemes>
): Item {
  return {
    label: "ノードをペースト",
    key: "paste-nodes",
    handler: async () => {
      // クリップボードから JSON を取得してidとpositionを変更して貼り付け実行
      await pasteGraphFromClipboard(pointerPosition, nodeDeps, groupPlugin);
    },
  };
}

/**
 * クリップボードのテキストを GraphJsonData として読み取る
 */
async function parseClipboardGraphJson(): Promise<GraphJsonData | null> {
  try {
    const clipboardData = await navigator.clipboard.readText();
    const parsed = JSON.parse(clipboardData);
    if (!isGraphJsonData(parsed)) {
      console.warn("Clipboard JSON is not a valid GraphJsonData");
      return null;
    }
    return parsed;
  } catch (e) {
    // パースエラーや権限エラーを包含
    console.warn("Failed to read/parse clipboard as GraphJsonData", e);
    return null;
  }
}

/**
 * GraphJsonData の最低限のバリデーション
 */
function isGraphJsonData(data: unknown): data is GraphJsonData {
  const d = data as Partial<GraphJsonData> | null | undefined;
  return !!d && Array.isArray(d.nodes) && Array.isArray(d.connections);
}

/**
 * ペースト時にnode connection双方のIDを新しくして再割り当てするため、旧 -> 新 ノードIDの対応表を作成
 */
function buildNewNodeIdMap(nodes: NodeJson[]): Map<string, string> {
  const idMap = new Map<string, string>();
  for (const n of nodes) idMap.set(n.id, getUID());
  return idMap;
}

/**
 * ノードIDと位置の再割り当て
 */
function remapNodes(
  pointerPosition: { x: number; y: number },
  nodes: NodeJson[],
  idMap: Map<string, string>
): NodeJson[] {
  return nodes.map((n) => ({
    ...n,
    id: idMap.get(n.id) ?? n.id,
    position: {
      x: n.position.x + pointerPosition.x,
      y: n.position.y + pointerPosition.y,
    },
  }));
}

/**
 * コネクションIDとノード参照の再割り当て
 */
function remapConnections(
  connections: ConnectionJson[],
  idMap: Map<string, string>
): ConnectionJson[] {
  return connections.map((c) => ({
    ...c,
    id: getUID(),
    source: idMap.get(c.source) ?? c.source,
    sourcePort: c.sourceOutput,
    target: idMap.get(c.target) ?? c.target,
    targetPort: c.targetInput,
  }));
}

function remapGroups(
  groups: GroupJson[],
  idMap: Map<string, string>
): GroupJson[] {
  return groups.map((g: GroupJson) => ({
    ...g,
    id: getUID(),
    links: g.links.map((l) => idMap.get(l) ?? l),
  }));
}

/**
 * 置換済みグラフを生成
 */
function createRemappedGraph(
  pointerPosition: { x: number; y: number },
  idMap: Map<string, string>,
  jsonData: GraphJsonData
): GraphJsonData {
  return {
    version: jsonData.version ?? "1.0",
    nodes: remapNodes(pointerPosition, jsonData.nodes, idMap),
    connections: remapConnections(jsonData.connections, idMap),
    groups: jsonData.groups ? remapGroups(jsonData.groups, idMap) : undefined,
  };
}

/**
 * クリップボードからのペースト一連処理
 */
async function pasteGraphFromClipboard(
  pointerPosition: { x: number; y: number },
  nodeDeps: NodeDeps,
  groupPlugin: GroupPlugin<Schemes>
) {
  const jsonData = await parseClipboardGraphJson();
  if (!jsonData) return;

  const remapped = createRemappedGraph(
    pointerPosition,
    buildNewNodeIdMap(jsonData.nodes),
    jsonData
  );

  // ノードをエディタに登録
  await deserializeGraphIntoEditor({
    graphJsonData: remapped,
    ...nodeDeps,
    groupPlugin,
  });
}
