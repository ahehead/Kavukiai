import { deserializeGraphIntoEditor } from "renderer/nodeEditor/features/deserializeGraph/deserializeGraph";
import type { GroupPlugin } from "renderer/nodeEditor/features/group";
import type { NodeDeps } from "renderer/nodeEditor/nodes/nodeFactories";
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
  };
}

// Public API: paste a workflow into the editor at a pointer position
export async function pasteWorkflowAtPosition({
  workflow,
  pointerPosition,
  nodeDeps,
  groupPlugin,
}: PasteWorkflowAtPositionArgs): Promise<void> {
  const idMap = buildNewNodeIdMap(workflow.nodes);
  const remapped = createRemappedGraph(pointerPosition, idMap, workflow);

  await deserializeGraphIntoEditor({
    graphJsonData: remapped,
    ...nodeDeps,
    groupPlugin,
  });
}
