// --- サードパーティ・モジュール ---
import { createRoot } from "react-dom/client";
import { NodeEditor } from "rete";
import { AreaExtensions, AreaPlugin } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import { ReactPlugin } from "rete-react-plugin";
import {
  Presets as HistoryPresets,
  HistoryExtensions,
  type HistoryActions,
  HistoryPlugin,
} from "rete-history-plugin";
import { ControlFlowEngine, DataflowEngine } from "rete-engine";

import { GridLineSnapPlugin } from "./features/gridLineSnap/GridLine";
import { setupDragPan } from "./features/dragPan";
import {
  getCurrentEditorState,
  type NodeEditorState,
  patchHistoryAdd,
  resetEditorState,
} from "./features/editor_state/historyState";
import { setupSocketConnectionState } from "./features/updateConnectionState/updateConnectionState";
import { disableDoubleClickZoom } from "./features/disable_double_click_zoom/disableDoubleClickZoom";

import { CustomContextMenu } from "./component/CustomContextMenu";
import { setupContextMenu } from "./features/contextMenu/setupContextMenu";
import { customReactPresets } from "./features/customReactPresets/customReactPresets";
import type { AreaExtra, Schemes } from "./types";

export async function createNodeEditor(container: HTMLElement) {
  const editor = new NodeEditor<Schemes>();

  // エンジンのインスタンス化
  const dataflow = new DataflowEngine<Schemes>(({ inputs, outputs }) => {
    return {
      inputs: (): string[] =>
        Object.keys(inputs).filter((name) => name !== "exec"),
      outputs: (): string[] =>
        Object.keys(outputs).filter((name) => name !== "exec"),
    };
  });
  const controlflow = new ControlFlowEngine<Schemes>(() => {
    return {
      inputs: (): ["exec"] => ["exec"],
      outputs: (): ["exec"] => ["exec"],
    };
  });

  // History pluginのインスタンス化（undo/redo管理）
  const history = new HistoryPlugin<Schemes, HistoryActions<Schemes>>({
    timing: 200,
  });

  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  AreaExtensions.simpleNodesOrder(area);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });
  const contextMenu = setupContextMenu({
    editor,
    area,
    dataflow,
    controlflow,
    history,
  });

  const gridLine = new GridLineSnapPlugin<Schemes>({ baseSize: 20 });

  // エディタにプラグインを接続
  editor.use(dataflow);
  editor.use(controlflow);
  editor.use(area);
  area.use(history);
  area.use(connection);
  area.use(contextMenu);
  area.use(render);
  area.use(gridLine);

  // ズームの値を保持
  let currentZoom = 1;
  area.addPipe((context) => {
    if (context.type === "zoomed") {
      currentZoom = context.data.zoom;
      return context;
    }
    return context;
  });
  const getZoom = () => currentZoom;

  // コネクションの作成時と削除時に、ソケットの接続状態を更新
  setupSocketConnectionState(editor, area);

  // context menuのカスタマイズ
  render.addPreset({
    render(context: any) {
      if (context.data.type === "contextmenu") {
        return CustomContextMenu({
          items: context.data.items,
          searchBar: context.data.searchBar,
          onHide: context.data.onHide,
        });
      }
    },
  });
  connection.addPreset(ConnectionPresets.classic.setup());
  // react pluginのカスタマイズ
  render.addPreset(customReactPresets(area, history, getZoom));

  // Undo/Redo機能有効化
  history.addPreset(HistoryPresets.classic.setup());
  HistoryExtensions.keyboard(history);

  // マウスクリックと、マウス中ボタンで領域パンするようにする
  setupDragPan(area);
  // ダブルクリックでズームするのを無効化
  disableDoubleClickZoom(area);

  return {
    destroy: () => area.destroy(),
    // 現在のnode editorの状態を取得
    getCurrentEditorState: () => getCurrentEditorState(editor, area, history),
    // node stateを再設定
    resetEditorState: async (payload: NodeEditorState) =>
      await resetEditorState({
        payload,
        editor,
        area,
        dataflow,
        controlflow,
        history,
      }),

    // historyのaddをオーバーライドして、履歴が追加されたときにコールバックを実行する
    patchHistoryAdd: (callback: () => void) =>
      patchHistoryAdd(history, callback),
  };
}
