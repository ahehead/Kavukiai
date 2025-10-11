import { getSelectedNodes } from "renderer/nodeEditor/nodes/util/getSelectedNodes";
import type { NodeEditor } from "rete";
import { removeNodeWithConnections } from "../../nodes/util/removeNode";
import type { Schemes } from "../../types";
import type { GroupPlugin } from "../group";

export function setupDeleteSelectedNodes(
  editor: NodeEditor<Schemes>,
  groupPlugin: GroupPlugin<Schemes>
): () => void {
  const handler = async (e: KeyboardEvent) => {
    if (e.key !== "Delete") return;
    for (const node of getSelectedNodes(editor)) {
      await removeNodeWithConnections(editor, node.id);
    }
    const selectedGroups = Array.from(groupPlugin.groups.values()).filter(
      (group) => group.selected
    );
    for (const group of selectedGroups) {
      groupPlugin.delete(group.id);
    }
  };

  window.addEventListener("keydown", handler);
  return () => {
    window.removeEventListener("keydown", handler);
  };
}
