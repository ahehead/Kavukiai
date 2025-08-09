import type { NodeEditor } from "rete";
import type { Item } from "rete-context-menu-plugin/_types/types";
import { removeNodeWithConnections } from "../../../../nodes/util/removeNode";
import type { Schemes } from "../../../../types/Schemes";

export function createDeleteNodeItem(
  context: { id: string },
  editor: NodeEditor<Schemes>
): Item {
  return {
    label: "ノードを削除",
    key: "delete-node",
    async handler() {
      await removeNodeWithConnections(editor, context.id);
      for (const node of editor.getNodes().filter((node) => node.selected)) {
        await removeNodeWithConnections(editor, node.id);
      }
    },
  };
}
