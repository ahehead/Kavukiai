// --- サードパーティ・モジュール ---
import { createRoot } from "react-dom/client";
import { ClassicPreset, NodeEditor } from "rete";
import { AreaPlugin } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import { ReactPlugin, Presets as ReactPresets } from "rete-react-plugin";
import {
  ContextMenuPlugin,
  Presets as ContextMenuPresets,
} from "rete-context-menu-plugin";
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
  StringNode,
  MultiLineStringNode,
  RunNode,
  ViewStringNode,
} from "./nodes/Node";
import { ExecSocket } from "./nodes/Sockets";
import {
  RunButtonControl,
  RunButtonControlView,
} from "./nodes/Controls/RunButton";

import {
  MultiLineControl,
  TextAreaControllView,
} from "./nodes/Controls/TextArea";

import { CustomExecSocket, CustomSocket, CustomNodeComponent } from "./custom";

import { canCreateConnection } from "./features/socket_type_restriction/canCreateConnection";
import { GridLineSnapPlugin } from "./features/gridLineSnap/GridLine";
import { exportGraph } from "shared/exportGraph";
import { setupDragPan } from "./features/dragPan";
import {
  extractHistoryState,
  type HistoryState,
  restoreHistoryState,
} from "./features/historyState";

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
  const engine = new ControlFlowEngine<Schemes>(() => {
    return {
      inputs: (): ["exec"] => ["exec"],
      outputs: (): ["exec"] => ["exec"],
    };
  });

  // History pluginのインスタンス化（undo/redo管理）
  const history = new HistoryPlugin<Schemes, HistoryActions<Schemes>>();

  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });
  // Context menu pluginのインスタンス化
  const contextMenu = new ContextMenuPlugin({
    items: ContextMenuPresets.classic.setup([
      // 右クリックメニューの項目リスト
      ["String", () => new StringNode()],
      ["MultiLineString", () => new MultiLineStringNode("", history, area)],
      ["Run", () => new RunNode(engine)],
      ["ViewString", () => new ViewStringNode(dataflow, area)],
    ]),
  });

  const gridLine = new GridLineSnapPlugin<Schemes>({ baseSize: 20 });

  // エディタにプラグインを接続
  editor.use(dataflow);
  editor.use(engine);
  editor.use(area);
  area.use(history);
  area.use(connection);
  area.use(contextMenu);
  area.use(render);
  area.use(gridLine);

  // コネクションのバリデーション
  editor.addPipe((context) => {
    if (context.type === "connectioncreate") {
      if (!canCreateConnection(editor, context.data)) {
        return;
      }
    }
    return context;
  });

  //// ここよりプリセットの設定 ////

  render.addPreset(ReactPresets.contextMenu.setup());
  connection.addPreset(ConnectionPresets.classic.setup());
  // カスタムコントロール用レンダリング設定
  render.addPreset(
    ReactPresets.classic.setup({
      customize: {
        socket(data) {
          if (data.payload instanceof ExecSocket) {
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
          if (data.payload instanceof ClassicPreset.InputControl) {
            return ReactPresets.classic.Control;
          }

          return null;
        },
        node() {
          return CustomNodeComponent;
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
  area.addPipe((context) => {
    if (context.type === "zoom" && context.data.source === "dblclick") return;
    return context;
  });

  // historyのタイミングで状態を保存する予定、今はconsole.logするだけ
  const originalAdd = history.add.bind(history);
  history.add = (action) => {
    originalAdd(action);
    //console.log("history add");
  };
  const originalUndo = history.undo.bind(history);
  history.undo = async () => {
    const result = await originalUndo();
    console.log("history undo", result);
    const a = await exportGraph(editor, area);
    console.log(a);
    return result;
  };
  const originalRedo = history.redo.bind(history);
  history.redo = async () => {
    const result = await originalRedo();
    console.log("history redo", result);
    return result;
  };

  return {
    destroy: () => area.destroy(),
    extractHistoryState: () => extractHistoryState(editor, area, history),
    restoreHistoryState: (state: HistoryState) =>
      restoreHistoryState(state, editor, area, dataflow, engine, history),
  };
}
