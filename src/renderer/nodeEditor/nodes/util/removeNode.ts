import type { Schemes } from "renderer/nodeEditor/types/Schemes";
import type { NodeEditor } from "rete";

export async function removeNodeWithConnections(
  editor: NodeEditor<Schemes>,
  nodeId: string
): Promise<void> {
  for (const item of [...editor.getConnections()]) {
    if (item.source === nodeId || item.target === nodeId) {
      await editor.removeConnection(item.id);
    }
  }
  await editor.removeNode(nodeId);
}

// socket keyがtargetになっているコネクションを全て削除する
export async function removeLinkedSockets(
  editor: NodeEditor<Schemes>,
  nodeId: string,
  key: string
): Promise<void> {
  for (const connection of [...editor.getConnections()]) {
    if (connection.target === nodeId && connection.targetInput === key) {
      await editor.removeConnection(connection.id);
    }
  }
}

/**
 * 指定したノードの出力ポートに接続されているコネクションを取得する
 */
export function getConnectionsByOutputPortKey(
  editor: NodeEditor<Schemes>,
  nodeId: string,
  portKey: string
) {
  const connections = editor.getConnections();
  return connections.filter(
    (connection) =>
      connection.source === nodeId && connection.sourceOutput === portKey
  );
}
