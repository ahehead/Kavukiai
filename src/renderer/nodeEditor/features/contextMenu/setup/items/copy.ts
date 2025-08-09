import {
  convertNodeToJson,
  getConnectionsForNodes,
} from "renderer/nodeEditor/features/serializeGraph/serializeGraph";
import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { Item } from "rete-context-menu-plugin/_types/types";
import type {
  ConnectionJson,
  GraphJsonData,
  NodeJson,
} from "../../../../../../shared/JsonType";
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
      // 選択中のノード（右クリック対象を必ず含む）を収集
      const targetNodes = [
        context,
        ...editor
          .getNodes()
          .filter((node) => node.selected && node.id !== context.id),
      ];

      // ノードをJSON化（IDは変えない）
      const jsonNodes: NodeJson[] = [];
      for (const node of targetNodes) {
        const nodeJson = convertNodeToJson(node, area);
        if (!nodeJson) continue; // 位置が取れない等の場合はスキップ
        jsonNodes.push(nodeJson);
      }

      // 対象ノード間の接続のみ取得（IDや参照は変えない）
      const jsonConnections: ConnectionJson[] = getConnectionsForNodes(
        targetNodes,
        editor
      );

      // GraphJsonData としてクリップボードへ
      const jsonData: GraphJsonData = {
        version: "1.0",
        nodes: jsonNodes,
        connections: jsonConnections,
      };
      navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    },
  };
}
