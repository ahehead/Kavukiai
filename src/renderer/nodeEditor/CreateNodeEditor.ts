// --- サードパーティ・モジュール ---
import { createRoot } from "react-dom/client";
import { NodeEditor } from "rete";
import { AreaExtensions, AreaPlugin } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import { ControlFlowEngine } from "rete-engine";
import {
  type HistoryActions,
  HistoryExtensions,
  HistoryPlugin,
  Presets as HistoryPresets,
} from "rete-history-plugin";
import { ReactPlugin } from "rete-react-plugin";
import { customContextMenuPreset } from "./features/contextMenu/setup/CustomContextMenuPreset";
import { setupContextMenu } from "./features/contextMenu/setup/SetupContextMenu";
import { customReactPresets } from "./features/customReactPresets/customReactPresets";
import { setupDeleteSelectedNodes } from "./features/deleteSelectedNodes/deleteSelectedNodes";
import { disableDoubleClickZoom } from "./features/disable_double_click_zoom/disableDoubleClickZoom";
import { setupDragPan } from "./features/dragPan";
import {
  getCurrentEditorState,
  type NodeEditorState,
  patchHistoryAdd,
  resetEditorState,
} from "./features/editor_state/historyState";
import { GridLineSnapPlugin } from "./features/gridLineSnap/GridLine";
import { accumulateOnShift } from "./features/nodeSelection/accumulateOnShift";
import { RectSelectPlugin } from "./features/nodeSelection/RectSelectPlugin";
import { selectableNodes, selector } from "./features/nodeSelection/selectable";
import { DataflowEngine } from "./features/safe-dataflow/dataflowEngin";
import { registerConnectionPipeline } from "./features/updateConnectionState/updateConnectionState";
import { type AreaExtra, ExecList, isExecKey, type Schemes } from "./types";

export async function createNodeEditor(container: HTMLElement) {
  const editor = new NodeEditor<Schemes>();

  // エンジンのインスタンス化
  const dataflow = new DataflowEngine<Schemes>(({ inputs, outputs }) => ({
    // exec系（制御フロー）ソケットはデータフローから除外する
    inputs: (): string[] =>
      Object.keys(inputs).filter((name) => !isExecKey(name)),
    outputs: (): string[] =>
      Object.keys(outputs).filter((name) => !isExecKey(name)),
  }));
  const controlflow = new ControlFlowEngine<Schemes>(() => {
    return {
      inputs: (): string[] => [...ExecList],
      outputs: (): string[] => [...ExecList],
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
  // 右クリックメニュー
  const contextMenu = setupContextMenu({
    editor,
    area,
    dataflow,
    controlflow,
    history,
  });

  // グリッドラインスナッププラグインのインスタンス化
  const gridLine = new GridLineSnapPlugin<Schemes>({ container, baseSize: 20 });

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

  // コネクションの作成時と削除時に、ソケットの接続状態とデータフローを更新
  registerConnectionPipeline(editor, area, dataflow);

  // context menuのカスタマイズ
  render.addPreset(customContextMenuPreset());

  connection.addPreset(ConnectionPresets.classic.setup());
  // react pluginのカスタマイズ
  render.addPreset(customReactPresets(area, history, getZoom));

  // Undo/Redo機能有効化
  history.addPreset(HistoryPresets.classic.setup());
  HistoryExtensions.keyboard(history);

  // 領域パンのキー設定
  const cleanupDragPan = setupDragPan(area);
  // ダブルクリックでズームするのを無効化
  disableDoubleClickZoom(area);

  const cleanupDeleteKey = setupDeleteSelectedNodes(editor);

  // ノードの選択、追加
  const sn = selectableNodes(area, selector(), {
    accumulating: accumulateOnShift(),
  });

  // 矩形選択
  area.use(
    new RectSelectPlugin({
      editor,
      container,
      getZoom,
      selectableNodes: sn,
    })
  );

  // 外部に公開するAPI
  return {
    destroy: () => {
      area.destroy();
      cleanupDragPan();
      cleanupDeleteKey();
    },

    // 現在のnode editorの状態を取得
    getCurrentEditorState: () => getCurrentEditorState(editor, area, history),

    // Editorの状態を再設定
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
