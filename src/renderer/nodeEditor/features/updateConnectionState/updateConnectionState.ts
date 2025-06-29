import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { Schemes, AreaExtra, NodeInterface } from "../../types/Schemes";
import {
  canConnect,
  getConnectionSockets,
} from "../socket_type_restriction/canCreateConnection";
import type { DataflowEngine } from "rete-engine";
import { resetCacheDataflow } from "renderer/nodeEditor/nodes/util/resetCacheDataflow";
import {
  ExecList,
  type Connection,
  type TypedSocket,
} from "renderer/nodeEditor/types";
import { isDynamicSchemaNode } from "renderer/nodeEditor/types/Node/DynamicSchemaNode";
import { getConnectionsByOutputPortKey } from "renderer/nodeEditor/nodes/util/removeNode";

/**
 * ソケットの接続／切断イベントに応じて
 * - バリデーション
 * - ソケット状態の更新
 * - 接続状態に応じて Schema を更新するノードのメソッドを呼び出す
 * を行うパイプラインをエディタに登録する。
 */
export function registerConnectionPipeline(
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>,
  dataflow: DataflowEngine<Schemes>
): void {
  editor.addPipe(async (ctx) => {
    switch (ctx.type) {
      case "connectioncreate":
        if (!canConnect(editor, ctx.data)) return; // NG ならパイプ停止
        break;

      case "connectioncreated":
      case "connectionremoved": {
        const isConnected = ctx.type === "connectioncreated";
        const { source, target } = getConnectionSockets(editor, ctx.data);
        if (!source || !target) return ctx;

        resetCacheDataflow(dataflow, ctx.data.target);
        await syncSocketState(area, ctx.data, isConnected, source, target);
        await updateDynamicSchemaNode(
          editor,
          ctx.data,
          isConnected,
          source,
          target
        );
        break;
      }
    }
    return ctx;
  });
}

/**
 * getConnectionPorts で得た入出力ソケットの connected フラグを更新し、
 * 対応ノードを再描画する。
 */
async function syncSocketState(
  area: AreaPlugin<Schemes, AreaExtra>,
  data: Schemes["Connection"],
  connected: boolean,
  source: TypedSocket,
  target: TypedSocket
): Promise<void> {
  source.setConnected(connected);
  await area.update("node", data.source);
  target.setConnected(connected);
  await area.update("node", data.target);
}

/**
 * 接続状態に応じて Schema を更新するノードのメソッドを呼び出し、
 * 以降の動的ノードも再帰的に処理する
 */
async function updateDynamicSchemaNode(
  editor: NodeEditor<Schemes>,
  data: Connection<NodeInterface, NodeInterface>,
  isConnected: boolean,
  source: TypedSocket,
  target: TypedSocket
): Promise<void> {
  const targetNode = editor.getNode(data.target);
  if (!targetNode) return;
  if (!isDynamicSchemaNode(targetNode)) return;
  if (ExecList.includes(data.targetInput)) return;
  await traverseDynamicSchemaNodes(
    editor,
    data,
    targetNode,
    isConnected,
    source,
    target
  );
}

/**
 * 動的スキーマノードを再帰的にたどり、
 * onConnectionChangedSchema を呼び、無効な接続は削除する
 */
async function traverseDynamicSchemaNodes(
  editor: NodeEditor<Schemes>,
  data: Connection<NodeInterface, NodeInterface>,
  node: NodeInterface,
  isConnected: boolean,
  source: TypedSocket,
  target: TypedSocket,
  visited = new Set<string>()
): Promise<void> {
  if (visited.has(node.id)) return;
  visited.add(node.id);
  if (!isDynamicSchemaNode(node)) return;

  try {
    // スキーマ更新メソッド呼び出し
    const keys = await node.onConnectionChangedSchema({
      isConnected,
      data,
      source,
      target,
    });

    for (const key of keys) {
      const connections = getConnectionsByOutputPortKey(editor, node.id, key);
      for (const conn of connections) {
        // 接続先ノードを取得
        const nextNode = editor.getNode(conn.target);
        if (!nextNode) continue;

        let isNextConnected = true;
        // 接続がバリデーションNGなら削除
        if (!canConnect(editor, conn)) {
          try {
            await editor.removeConnection(conn.id);
          } catch (error) {
            console.warn(`Failed to remove connection ${conn.id}:`, error);
          }
          isNextConnected = false;
        }
        const { source: nextSource, target: nextTarget } = getConnectionSockets(
          editor,
          conn
        );
        if (!nextSource || !nextTarget) continue;

        // 再帰的にたどる
        await traverseDynamicSchemaNodes(
          editor,
          conn,
          nextNode,
          isNextConnected,
          nextSource,
          nextTarget,
          visited
        );
      }
    }
  } catch (error) {
    console.error(
      `Error in onConnectionChangedSchema for node ${node.id}:`,
      error
    );
  } finally {
    visited.delete(node.id);
  }
}
