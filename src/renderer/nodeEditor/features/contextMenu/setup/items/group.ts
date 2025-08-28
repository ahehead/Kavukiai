import type { NodeEditor } from "rete";
import type { Item } from "rete-context-menu-plugin/_types/types";
import type { NodeTypes, Schemes } from "../../../../types/Schemes";
import type { Group, GroupPlugin } from "../../../group";
import { collectTargetNodes } from "./copy";

/**
 * グループ化メニュー項目を生成
 */
export function createGroupMenuItem(
  context: NodeTypes,
  editor: NodeEditor<Schemes>,
  groupPlugin: GroupPlugin<Schemes>
): Item {
  return {
    label: "グループ化",
    key: "grouping",
    handler: () => {
      const nodeIds = collectTargetNodes(context, editor).map((n) => n.id);
      // TODO: グループ名は後でリネーム可能にする（暫定で 'test'）
      groupPlugin.addGroup("test", nodeIds);
    },
  };
}

/**
 * グループ削除メニュー項目を生成
 */
export function createDeleteGroupMenuItem(
  group: Group,
  groupPlugin: GroupPlugin<Schemes>
): Item {
  return {
    label: "グループを削除",
    key: "delete-group",
    handler: () => groupPlugin.delete(group.id),
  };
}
