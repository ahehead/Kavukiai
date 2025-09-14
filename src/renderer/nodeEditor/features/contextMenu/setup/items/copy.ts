import { notify } from "renderer/features/toast-notice/notify";
import { buildGraphJsonForCopy } from "renderer/nodeEditor/features/serializeGraph/serializeGraph";
import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { Item } from "rete-context-menu-plugin/_types/types";
import type { GraphJsonData } from "../../../../../../shared/JsonType";
import type {
  AreaExtra,
  NodeTypes,
  Schemes,
} from "../../../../types/ReteSchemes";
export function createCopyItem(
  context: NodeTypes,
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>
): Item {
  return {
    label: "ノードをコピー",
    key: "copy-nodes",
    handler: async () => {
      // 共通関数で GraphJsonData を生成
      const jsonData: GraphJsonData = buildGraphJsonForCopy(
        editor,
        area,
        collectTargetNodes(context, editor)
      );

      try {
        await navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        notify("error", "Failed to copy to clipboard");
      }

      notify("success", "Nodes copied to clipboard");
    },
  };
}

// 選択中のノード（右クリック対象を必ず含む）を収集
export function collectTargetNodes(
  context: NodeTypes,
  editor: NodeEditor<Schemes>
): NodeTypes[] {
  return [
    context,
    ...editor
      .getNodes()
      .filter((node) => node.selected && node.id !== context.id),
  ];
}
