import { serializeSubgraph } from "renderer/nodeEditor/features/serializeGraph/serializeGraph";
import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { Item } from "rete-context-menu-plugin/_types/types";
import type { AreaExtra, NodeTypes, Schemes } from "../../../../types/Schemes";
export function createCopyItem(
  context: NodeTypes,
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>
): Item {
  return {
    label: "ノードをコピー",
    key: "copy-nodes",
    handler: () => {
      const selectedNodes = editor.getNodes().filter((node) => node.selected);
      const result = [
        context,
        ...selectedNodes.filter((node) => node.id !== context.id),
      ];
      const jsonData = serializeSubgraph(result, editor, area);
      navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    },
  };
}
