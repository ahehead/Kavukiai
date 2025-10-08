import { collectTargetNodes } from "renderer/nodeEditor/nodes/util/getSelectedNodes";
import type { NodeInterface, Schemes } from "renderer/nodeEditor/types";
import type { NodeEditor } from "rete";
import type { GroupPlugin } from ".";

export function createGroupFromSelection(
  groupPlugin: GroupPlugin<Schemes>,
  context: NodeInterface,
  editor: NodeEditor<Schemes>
) {
  groupPlugin.addGroup(
    "Memo",
    collectTargetNodes(context, editor).map((n) => n.id)
  );
}
