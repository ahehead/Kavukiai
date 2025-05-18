import type { Schemes } from "renderer/nodeEditor/types";
import type { NodeEditor } from "rete";

export async function removeNodeWithConnections(
  editor: NodeEditor<Schemes>,
  nodeId: string
): Promise<void> {
  for (const item of [...editor.getConnections()]) {
    if (item.source === nodeId || item.target === nodeId) {
      await editor.removeConnection(item.id);
    }
  }
  await editor.removeNode(nodeId);
}
