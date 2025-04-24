import { createRoot } from "react-dom/client";

import type { GetSchemes, ClassicPreset } from "rete";
import { NodeEditor } from "rete";

import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import type { ReactArea2D } from "rete-react-plugin";
import { ReactPlugin, Presets as ReactPresets } from "rete-react-plugin";
import {
  ContextMenuPlugin,
  Presets as ContextMenuPresets,
} from "rete-context-menu-plugin";
import { StringNode } from "renderer/nodeEditor/nodes/BasicNodes";

import type { ContextMenuExtra } from "rete-context-menu-plugin";

import type { HistoryActions } from "rete-history-plugin";
import { HistoryPlugin, Presets as HistoryPresets } from "rete-history-plugin";
import { HistoryExtensions } from "rete-history-plugin";

// ReactArea2DとContextMenuExtraを合成
type Schemes = GetSchemes<
  ClassicPreset.Node,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;
type AreaExtra = ReactArea2D<Schemes> | ContextMenuExtra;

export async function createNodeEditor(container: HTMLElement) {
  const editor = new NodeEditor<Schemes>();

  // History pluginのインスタンス化（undo/redo管理）
  const history = new HistoryPlugin<Schemes, HistoryActions<Schemes>>();
  // Context menu pluginのインスタンス化
  const contextMenu = new ContextMenuPlugin({
    items: ContextMenuPresets.classic.setup([
      // 右クリックメニューの項目リスト
      ["String", () => new StringNode()],
    ]),
  });

  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });

  // エディタにプラグインを接続
  editor.use(area);
  area.use(connection);
  area.use(history);
  area.use(contextMenu);
  area.use(render);

  connection.addPreset(ConnectionPresets.classic.setup());
  // カスタムコントロール用レンダリング設定
  render.addPreset(ReactPresets.classic.setup());

  // Undo/Redo機能有効化
  history.addPreset(HistoryPresets.classic.setup());
  HistoryExtensions.keyboard(history);

  // テスト用に基本ノードを画面に追加
  const stringNode = new StringNode();
  await area.translate(stringNode.id, { x: 20, y: 20 });
  await editor.addNode(stringNode);

  await AreaExtensions.zoomAt(area, editor.getNodes());

  return {
    destroy: () => area.destroy(),
  };
}
