import type { NodeEditor } from "rete";
import type { Item } from "rete-context-menu-plugin/_types/types";
import type { NodeTypes, Schemes } from "../../../../types/ReteSchemes";
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
      // TODO: グループ名は後でリネーム可能にする（暫定で 'Memo'）
      groupPlugin.addGroup("Memo", nodeIds);
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

export function orderGroupMenuItems(
  group: Group,
  groupPlugin: GroupPlugin<Schemes>
): Item {
  return {
    label: "グループの順番",
    key: "group-order-items",
    handler: () => void 0,
    subitems: [
      {
        label: "最前面へ移動",
        key: "bring-to-front",
        handler: () => groupPlugin.bringGroupToFront(group),
      },
      {
        label: "一つ前へ移動",
        key: "bring-forward",
        handler: () => groupPlugin.bringGroupForward(group),
      },
      {
        label: "一つ後ろへ移動",
        key: "send-backward",
        handler: () => groupPlugin.sendGroupBackward(group),
      },
      {
        label: "最背面へ移動",
        key: "send-to-back",
        handler: () => groupPlugin.sendGroupToBack(group),
      },
    ],
  };
}
