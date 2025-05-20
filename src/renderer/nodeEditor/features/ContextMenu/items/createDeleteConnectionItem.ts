import type { NodeEditor } from "rete";
import type { Schemes } from "../../../types";
import type { Item } from "rete-context-menu-plugin/_types/types";

export function createDeleteConnectionItem(
  context: { id: string },
  editor: NodeEditor<Schemes>
): Item {
  return {
    label: "接続を削除",
    key: "delete-connection",
    async handler() {
      await editor.removeConnection(context.id);
    },
  };
}
