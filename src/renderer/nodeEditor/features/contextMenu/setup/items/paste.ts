import { loadGraphFromJson } from "renderer/nodeEditor/features/loadGraphFromJson/loadGraphFromJson";
import type { NodeDeps } from "renderer/nodeEditor/nodes/nodeFactories";
import { getUID } from "rete";
import type { Item } from "rete-context-menu-plugin/_types/types";
import type {
  ConnectionJson,
  GraphJsonData,
  NodeJson,
} from "../../../../../../shared/JsonType";

export function createPasteItem(nodeDeps: NodeDeps): Item {
  return {
    label: "ノードをペースト",
    key: "paste-nodes",
    handler: async () => {
      // クリップボードから JSON を取得して貼り付け実行
      await pasteGraphFromClipboard(nodeDeps);
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
 * 旧 -> 新 ノードIDの対応表を作成（ペースト時にIDを再割り当て）
 */
function buildNodeIdMap(nodes: NodeJson[]): Map<string, string> {
  const idMap = new Map<string, string>();
  for (const n of nodes) idMap.set(n.id, getUID());
  return idMap;
}

/**
 * ノードIDの再割り当て
 */
function remapNodes(nodes: NodeJson[], idMap: Map<string, string>): NodeJson[] {
  return nodes.map((n) => ({
    ...n,
    id: idMap.get(n.id) ?? n.id,
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
    sourcePort: c.sourcePort,
    target: idMap.get(c.target) ?? c.target,
    targetPort: c.targetPort,
  }));
}

/**
 * 置換済みグラフを生成
 */
function createRemappedGraph(
  jsonData: GraphJsonData,
  idMap: Map<string, string>
): GraphJsonData {
  return {
    version: jsonData.version ?? "1.0",
    nodes: remapNodes(jsonData.nodes, idMap),
    connections: remapConnections(jsonData.connections, idMap),
  };
}

/**
 * クリップボードからのペースト一連処理
 */
async function pasteGraphFromClipboard(nodeDeps: NodeDeps) {
  const jsonData = await parseClipboardGraphJson();
  if (!jsonData) return;

  const remapped = createRemappedGraph(
    jsonData,
    buildNodeIdMap(jsonData.nodes)
  );
  await loadGraphFromJson({ graphJsonData: remapped, ...nodeDeps });
}
