import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { Schemes, AreaExtra, NodeInterface } from "../../types/Schemes";
import {
  canCreateConnection,
  getConnectionPorts,
  getConnectionSockets,
} from "../socket_type_restriction/canCreateConnection";
import type { DataflowEngine } from "rete-engine";
import { resetCacheDataflow } from "renderer/nodeEditor/nodes/util/resetCacheDataflow";
import { InspectorNode, OpenAIParamNode } from "renderer/nodeEditor/nodes/Node";
import type { Connection } from "renderer/nodeEditor/types";

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
  // 1. connectioncreate 前のバリデーション
  editor.addPipe((context) => {
    if (
      context.type === "connectioncreate" &&
      !canCreateConnection(editor, context.data)
    ) {
      // バリデーション NG → パイプラインを停止
      return;
    }
    return context;
  });

  // 2. ソケットを「接続済み」に更新
  editor.addPipe((context) => {
    if (
      context.type === "connectioncreate" ||
      context.type === "connectioncreated"
    ) {
      // データキャッシュの廃棄処理
      resetCacheDataflow(dataflow, context.data.target);
      // ソケット状態の更新
      syncSocketState(editor, area, context.data, true, dataflow);

      notifyInspectorNode(editor, context.data, true);
      notifyOpenAIParamNode(editor, context.data, true);
    }
    if (
      context.type === "connectionremove" ||
      context.type === "connectionremoved"
    ) {
      resetCacheDataflow(dataflow, context.data.target);
      syncSocketState(editor, area, context.data, false, dataflow);
      notifyInspectorNode(editor, context.data, false);
      notifyOpenAIParamNode(editor, context.data, false);
    }
    return context;
  });
}

/**
 * getConnectionPorts で得た入出力ソケットの connected フラグを更新し、
 * 対応ノードを再描画する。
 */
function syncSocketState(
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>,
  data: any,
  connected: boolean,
  dataflow: DataflowEngine<Schemes>
): void {
  const { output, input } = getConnectionPorts(editor, data);
  if (!output || !input) return;

  output.socket.setConnected(connected);
  area.update("node", data.source);
  input.socket.setConnected(connected);
  area.update("node", data.target);
}

// 通知: InspectorNode の接続状態を更新
function notifyInspectorNode(
  editor: NodeEditor<Schemes>,
  data: Connection<NodeInterface, NodeInterface>,
  connected: boolean
): void {
  const targetNode = editor.getNode(data.target);
  if (!(targetNode instanceof InspectorNode)) return;
  if (data.targetInput === "exec") return;

  if (connected) {
    const { source, target } = getConnectionSockets(editor, data);
    if (!source || !target) return;
    targetNode.connected(source.getSchema());
  } else {
    targetNode.disconnected();
  }
}

// openaiParamNode の接続状態を更新
export function notifyOpenAIParamNode(
  editor: NodeEditor<Schemes>,
  data: Connection<NodeInterface, NodeInterface>,
  connected: boolean
): void {
  const targetNode = editor.getNode(data.target);
  if (!(targetNode instanceof OpenAIParamNode)) return;
  if (data.targetInput === "exec") return;

  if (connected) {
    const { source, target } = getConnectionSockets(editor, data);
    if (!source || !target) return;
    targetNode.connected();
  } else {
    targetNode.disconnected();
  }
}
