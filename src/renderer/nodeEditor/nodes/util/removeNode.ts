import type { Schemes } from "renderer/nodeEditor/types/ReteSchemes";
import type { NodeEditor } from "rete";

/**
 * 指定したノードとノードにつながるConnectionを削除する
 * @param editor NodeEditor instance
 * @param nodeId ノードID
 */
export async function removeNodeWithConnections(
  editor: NodeEditor<Schemes>,
  nodeId: string
): Promise<void> {
  for (const item of [...editor.getConnections()]) {
    if (item.source === nodeId || item.target === nodeId) {
      await editor.removeConnection(item.id);
    }
  }
  const node = editor.getNode(nodeId);
  if (node) (node as any).destroy?.();
  await editor.removeNode(nodeId);
}

//すべてのノードのdestroyメソッドを呼び出す
export async function destroyAllNodes(
  editor: NodeEditor<Schemes>
): Promise<void> {
  for (const node of editor.getNodes()) {
    await (node as any).destroy?.();
  }
}

/**
 * 指定したノードの、ソケットkeyにつながるコネクションを全て削除する
 */
export async function removeConnectionsFromInput(
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
 * 指定したノードの、ソケットkeyにつながるコネクションを全て削除する
 */
export async function removeConnectionsFromOutput(
  editor: NodeEditor<Schemes>,
  nodeId: string,
  key: string
): Promise<void> {
  for (const connection of [...editor.getConnections()]) {
    if (connection.source === nodeId && connection.sourceOutput === key) {
      await editor.removeConnection(connection.id);
    }
  }
}

/**
 * 指定したノードの、出力ポートkeyに接続されているコネクションを全て取得する
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
