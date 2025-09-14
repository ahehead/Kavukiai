import { notify } from "renderer/features/toast-notice/notify";
import { deserializeGraphIntoEditor } from "renderer/nodeEditor/features/deserializeGraph/deserializeGraph";
import type { GroupPlugin } from "renderer/nodeEditor/features/group";
import type { NodeDeps } from "renderer/nodeEditor/features/nodeFactory/factoryTypes";
import type { Schemes } from "renderer/nodeEditor/types";
import { getUID } from "rete";
import type {
  ConnectionJson,
  GraphJsonData,
  GroupJson,
  NodeJson,
} from "shared/JsonType";

export type PasteWorkflowAtPositionArgs = {
  workflow: GraphJsonData;
  pointerPosition: { x: number; y: number };
  nodeDeps: NodeDeps;
  groupPlugin: GroupPlugin<Schemes>;
};

// Create a map from old node IDs to new unique IDs
function buildNewNodeIdMap(nodes: NodeJson[]): Map<string, string> {
  const idMap = new Map<string, string>();
  for (const n of nodes) idMap.set(n.id, getUID());
  return idMap;
}

/**
 * ワークフローのノード群のバウンディングボックスを原点(0,0)とみなして
 * ノード位置・グループ矩形を相対位置に変換する
 */
export function toRelativeWorkflowByBBox(
  workflow: GraphJsonData
): GraphJsonData {
  if (!workflow.nodes || workflow.nodes.length === 0) return workflow;

  const minX = Math.min(...workflow.nodes.map((n) => n.position.x));
  const minY = Math.min(...workflow.nodes.map((n) => n.position.y));

  const relNodes: NodeJson[] = workflow.nodes.map((n) => ({
    ...n,
    position: {
      x: n.position.x - minX,
      y: n.position.y - minY,
    },
  }));

  const relGroups: GroupJson[] | undefined = workflow.groups?.map((g) => ({
    ...g,
    rect: {
      ...g.rect,
      left: g.rect.left - minX,
      top: g.rect.top - minY,
    },
  }));

  return {
    ...workflow,
    version: workflow.version ?? "1.0",
    nodes: relNodes,
    groups: relGroups,
  };
}

// Remap node IDs and offset positions by the pointer position
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

// Remap connection IDs and relink to remapped node IDs
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

// Remap group IDs and linked node IDs
function remapGroups(
  groups: GroupJson[] | undefined,
  idMap: Map<string, string>
): GroupJson[] | undefined {
  if (!groups) return undefined;
  return groups.map((g: GroupJson) => ({
    ...g,
    id: getUID(),
    links: g.links.map((l: string) => idMap.get(l) ?? l),
  }));
}

// Build a new workflow graph with remapped IDs and offset positions
function createRemappedGraph(
  pointerPosition: { x: number; y: number },
  idMap: Map<string, string>,
  jsonData: GraphJsonData
): GraphJsonData {
  return {
    version: jsonData.version ?? "1.0",
    nodes: remapNodes(pointerPosition, jsonData.nodes, idMap),
    connections: remapConnections(jsonData.connections, idMap),
    groups: remapGroups(jsonData.groups, idMap),
    metadata: jsonData.metadata,
  };
}

// Public API: paste a workflow into the editor at a pointer position
export async function pasteWorkflowAtPosition({
  workflow,
  pointerPosition,
  nodeDeps,
  groupPlugin,
}: PasteWorkflowAtPositionArgs): Promise<void> {
  // 1) 入力workflowの位置をbbox基準の相対位置へ正規化
  const relative = toRelativeWorkflowByBBox(workflow);
  // 2) 新しいノードIDマップを作成
  const idMap = buildNewNodeIdMap(relative.nodes);
  // 3) pointer位置へオフセット + 各種IDのリマップ
  const remapped = createRemappedGraph(pointerPosition, idMap, relative);
  // 4) エディタへデシリアライズ
  await deserializeGraphIntoEditor({
    graphJsonData: remapped,
    ...nodeDeps,
    groupPlugin,
  });
  notify("success", "Workflow pasted successfully");
}
