import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { Schemes, AreaExtra } from "../../types/Schemes";
import {
  canCreateConnection,
  getConnectionPorts,
} from "../socket_type_restriction/canCreateConnection";
import type { DataflowEngine } from "rete-engine";
import { resetCacheDataflow } from "renderer/nodeEditor/nodes/util/resetCacheDataflow";

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
      syncSocketState(editor, area, context.data, true, dataflow);
    }
    if (
      context.type === "connectionremove" ||
      context.type === "connectionremoved"
    ) {
      resetCacheDataflow(dataflow, context.data.target);
      syncSocketState(editor, area, context.data, false, dataflow);
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
