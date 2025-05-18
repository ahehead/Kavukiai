// --- サードパーティ・モジュール ---
import { createRoot } from "react-dom/client";
import { NodeEditor } from "rete";
import { AreaExtensions, AreaPlugin } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import { ReactPlugin, Presets as ReactPresets } from "rete-react-plugin";
import { ContextMenuPlugin } from "rete-context-menu-plugin";
import {
  Presets as HistoryPresets,
  HistoryExtensions,
  type HistoryActions,
  HistoryPlugin,
} from "rete-history-plugin";
import type { Schemes, AreaExtra } from "./types";
import { ControlFlowEngine, DataflowEngine } from "rete-engine";

// --- 自作モジュール ---
import {
  RunButtonControl,
  RunButtonControlView,
} from "./nodes/Controls/RunButton";

import {
  MultiLineControl,
  TextAreaControllView,
} from "./nodes/Controls/TextArea";

import { CustomExecSocket, CustomSocket } from "./component";

import { GridLineSnapPlugin } from "./features/gridLineSnap/GridLine";
import { setupDragPan } from "./features/dragPan";
import {
  getCurrentEditorState,
  type NodeEditorState,
  resetEditorState,
} from "./features/editor_state/historyState";
import { createCustomNode } from "./component/CustomBaseNode";
import { setupSocketConnectionState } from "./features/updateConnectionState/updateConnectionState";
import { ConsoleControl, ConsoleControlView } from "./nodes/Controls/Console";
import { disableDoubleClickZoom } from "./features/disable_double_click_zoom/disableDoubleClickZoom";
import {
  InputValueControl,
  InputValueControlView,
} from "./nodes/Controls/InputValue";
import {
  CheckBoxControl,
  CheckBoxControlView,
} from "./nodes/Controls/CheckBox";
import {
  ChatContextControl,
  ChatContextControlView,
} from "./nodes/Controls/ChatContext/ChatContext";
import { ContextMenu } from "./features/ContextMenu/Menu";

import { removeNodeWithConnections } from "./nodes/util/removeNode";
import { createReteContextMenuItems } from "./features/ContextMenu/createContextMenu";
import { contextMenuStructure } from "./nodes/nodeFactories";

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
  const contextMenu = new ContextMenuPlugin({
    items: (context, plugin) => {
      console.log("context", context);

      if (context === "root") {
        return {
          searchBar: true,
          list: createReteContextMenuItems(contextMenuStructure, editor, {
            area,
            dataflow,
            controlflow,
            history,
          }),
        };
      }
      return {
        searchBar: false,
        list: [
          {
            label: "Delete",
            key: "delete",
            async handler() {
              if ("source" in context && "target" in context) {
                // connection
                await editor.removeConnection(context.id);
              } else {
                // node
                await removeNodeWithConnections(editor, context.id);
              }
            },
          },
        ],
      };
    },
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

  //// ここよりプリセットの設定 ////

  render.addPreset({
    render(context: any) {
      if (context.data.type === "contextmenu") {
        console.log("contextmenu", context);
        return ContextMenu({
          items: context.data.items,
          searchBar: context.data.searchBar,
          onHide: context.data.onHide,
        });
      }
    },
  });
  connection.addPreset(ConnectionPresets.classic.setup());
  // カスタムコントロール用レンダリング設定
  render.addPreset(
    ReactPresets.classic.setup({
      customize: {
        socket(data) {
          if (data.payload.name === "exec") {
            return CustomExecSocket;
          }
          return CustomSocket;
        },
        control(data) {
          if (data.payload instanceof RunButtonControl) {
            return RunButtonControlView;
          }
          if (data.payload instanceof MultiLineControl) {
            return TextAreaControllView;
          }
          if (data.payload instanceof ConsoleControl) {
            return ConsoleControlView;
          }
          if (data.payload instanceof InputValueControl) {
            return InputValueControlView;
          }
          if (data.payload instanceof ChatContextControl) {
            return ChatContextControlView;
          }
          if (data.payload instanceof CheckBoxControl) {
            return CheckBoxControlView;
          }

          return null;
        },
        node() {
          return createCustomNode(area, history, getZoom);
        },
      },
    })
  );

  // Undo/Redo機能有効化
  history.addPreset(HistoryPresets.classic.setup());
  HistoryExtensions.keyboard(history);

  // マウスクリックと、マウス中ボタンで領域パン
  setupDragPan(area);
  // ダブルクリックでのズームを無効化
  disableDoubleClickZoom(area);

  return {
    destroy: () => area.destroy(),
    // 現在のnode editorの状態を取得
    getCurrentEditorState: () => getCurrentEditorState(editor, area, history),
    resetEditorState: async (state: NodeEditorState) =>
      await resetEditorState(
        state,
        editor,
        area,
        dataflow,
        controlflow,
        history
      ),

    // historyのaddをオーバーライドして、履歴が追加されたときにコールバックを実行する
    patchHistoryAdd: (callback: () => void) => {
      let timer: ReturnType<typeof setTimeout> | null = null;
      const orig = history.add.bind(history);

      history.add = (action) => {
        orig(action);
        if (timer) clearTimeout(timer);
        timer = setTimeout(callback, 200);
      };

      // 解除用関数を返す
      return () => {
        history.add = orig;
        if (timer) clearTimeout(timer);
      };
    },
  };
}
