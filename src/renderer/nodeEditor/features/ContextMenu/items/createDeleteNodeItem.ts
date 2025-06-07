import type { NodeEditor } from "rete";
import type { Schemes } from "../../../types/Schemes";
import { removeNodeWithConnections } from "../../../nodes/util/removeNode";
import type { Item } from "rete-context-menu-plugin/_types/types";

export function createDeleteNodeItem(
  context: { id: string },
  editor: NodeEditor<Schemes>
): Item {
  return {
    label: "ノードを削除",
    key: "delete-node",
    async handler() {
      await removeNodeWithConnections(editor, context.id);
      const nodes = editor.getNodes().filter((node) => node.selected);
      // console.log("Selected nodes to delete:", nodes);
      if (nodes.length > 0) {
        await Promise.all(
          nodes.map((node) => removeNodeWithConnections(editor, node.id))
        );
      }
    },
  };
}
