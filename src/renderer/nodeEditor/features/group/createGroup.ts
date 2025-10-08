import {
  collectTargetNodes,
  getSelectedNodes,
} from "renderer/nodeEditor/nodes/util/getSelectedNodes";
import type { NodeInterface, Schemes } from "renderer/nodeEditor/types";
import type { NodeEditor } from "rete";
import type { GroupPlugin } from ".";

export function createGroupFromSelection(
  groupPlugin: GroupPlugin<Schemes>,
  context: NodeInterface,
  editor: NodeEditor<Schemes>
) {
  groupPlugin.addGroup(collectTargetNodes(context, editor).map((n) => n.id));
}

export function createGroup(
  groupPlugin: GroupPlugin<Schemes>,
  editor: NodeEditor<Schemes>
) {
  return groupPlugin.addGroup(getSelectedNodes(editor).map((n) => n.id));
}
