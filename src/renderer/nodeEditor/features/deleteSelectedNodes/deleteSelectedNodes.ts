import { getSelectedNodes } from "renderer/nodeEditor/nodes/util/getSelectedNodes";
import type { NodeEditor } from "rete";
import { removeNodeWithConnections } from "../../nodes/util/removeNode";
import type { Schemes } from "../../types";

export function setupDeleteSelectedNodes(
  editor: NodeEditor<Schemes>
): () => void {
  const handler = async (e: KeyboardEvent) => {
    if (e.key !== "Delete") return;
    for (const node of getSelectedNodes(editor)) {
      await removeNodeWithConnections(editor, node.id);
    }
  };

  window.addEventListener("keydown", handler);
  return () => {
    window.removeEventListener("keydown", handler);
  };
}
