import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { Schemes, AreaExtra, NodeInterface } from "../../types/Schemes";
import {
  canCreateConnection,
  getConnectionSockets,
} from "../socket_type_restriction/canCreateConnection";
import type { DataflowEngine } from "rete-engine";
import { resetCacheDataflow } from "renderer/nodeEditor/nodes/util/resetCacheDataflow";
import type { Connection, TypedSocket } from "renderer/nodeEditor/types";
import { isDynamicSchemaNode } from "renderer/nodeEditor/types/Node/DynamicSchemaNode";

/**
 * ソケットの接続／切断イベントに応じて
 * - バリデーション
 * - ソケット状態の更新
 * - ノードの再描画
 * を行うパイプラインをエディタに登録する。
 */
export function setupSocketConnectionState(
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>,
  dataflow: DataflowEngine<Schemes>
): void {
  editor.addPipe(async (context) => {
    if (context.type === "connectioncreate") {
      const { source, target } = getConnectionSockets(editor, context.data);
      if (!canCreateConnection(source, target)) {
        // バリデーション NG → パイプラインを停止
        return;
      }
    }

    if (context.type === "connectioncreated") {
      const { source, target } = getConnectionSockets(editor, context.data);
      if (!source || !target) return;
      // データキャッシュの廃棄処理
      resetCacheDataflow(dataflow, context.data.target);
      // ソケット状態の更新
      await syncSocketState(area, context.data, true, source, target);
      // 接続状況でSchemaが変わるノードの更新
      await notifyDynamicSchemaNode(editor, context.data, true, source, target);
    }
    if (context.type === "connectionremoved") {
      const { source, target } = getConnectionSockets(editor, context.data);
      if (!source || !target) return;
      resetCacheDataflow(dataflow, context.data.target);
      await syncSocketState(area, context.data, false, source, target);
      await notifyDynamicSchemaNode(
        editor,
        context.data,
        false,
        source,
        target
      );
    }
    return context;
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
 * 通知: 接続状態に応じて Schema を更新するノードのメソッドを呼び出す。
 */
async function notifyDynamicSchemaNode(
  editor: NodeEditor<Schemes>,
  data: Connection<NodeInterface, NodeInterface>,
  isConnected: boolean,
  source: TypedSocket,
  target: TypedSocket
): Promise<void> {
  const targetNode = editor.getNode(data.target);
  if (!targetNode) return;
  if (!isDynamicSchemaNode(targetNode)) return;
  if (data.targetInput === "exec") return;
  await targetNode.onConnectionChangedSchema({ isConnected, source, target });
}
