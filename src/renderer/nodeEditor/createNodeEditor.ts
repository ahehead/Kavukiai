import { createRoot } from "react-dom/client";

import { ClassicPreset, NodeEditor } from "rete";

import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import { ReactPlugin, Presets as ReactPresets } from "rete-react-plugin";
import {
  ContextMenuPlugin,
  Presets as ContextMenuPresets,
} from "rete-context-menu-plugin";

import type { HistoryActions } from "rete-history-plugin";
import { HistoryPlugin, Presets as HistoryPresets } from "rete-history-plugin";
import { HistoryExtensions } from "rete-history-plugin";

import type { Schemes, AreaExtra } from "./types";
import { ControlFlowEngine, DataflowEngine } from "rete-engine";
import { StringNode } from "./nodes/String";
import { MultiLineStringNode } from "./nodes/MultiLineString";
import { RunButtonControlView, Run, RunButtonControl } from "./nodes/Run";
import { ViewStringNode } from "./nodes/ViewString";
import {
  MultiLineControl,
  TextAreaControllView,
} from "./nodes/components/TextArea";
import { ExecSocket } from "./nodes/Sockets";
import { CustomExecSocket } from "./custom/CustomExecSocket";
import { CustomSocket } from "./custom/CustomSocket";
import { CustomNodeComponent } from "./custom/CustomNodeComponent";
import { canCreateConnection } from "./features/socket_type_restriction/canCreateConnection";
import { addCustomBackground } from "./custom/background";

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
      ["MultiLineString", () => new MultiLineStringNode("")],
      ["Run", () => new Run(engine)],
      ["ViewString", () => new ViewStringNode(dataflow, area)],
    ]),
  });

  // エディタにプラグインを接続
  editor.use(dataflow);
  editor.use(engine);
  editor.use(area);
  area.use(history);
  area.use(connection);
  area.use(contextMenu);
  area.use(render);

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

  // 背景の設定
  addCustomBackground(area);

  // テスト用に基本ノードを画面に追加
  await editor.addNode(new StringNode());
  await editor.addNode(new MultiLineStringNode("hello"));
  await editor.addNode(new Run(engine));
  await editor.addNode(new ViewStringNode(dataflow, area));

  await AreaExtensions.zoomAt(area, editor.getNodes());

  return {
    destroy: () => area.destroy(),
  };
}
