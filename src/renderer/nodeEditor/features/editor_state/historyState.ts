import type { NodeDeps } from "renderer/nodeEditor/nodes/factoryTypes";
import { destroyAllNodes } from "renderer/nodeEditor/nodes/util/removeNode";
import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import { AreaExtensions } from "rete-area-plugin";
import type { HistoryActions, HistoryPlugin } from "rete-history-plugin";
import type { GraphJsonData } from "shared/JsonType";
import type { AreaExtra, Schemes } from "../../types/Schemes";
import { deserializeGraphIntoEditor } from "../deserializeGraph/deserializeGraph";
import type { GroupPlugin } from "../group";
import { serializeGraph } from "../serializeGraph/serializeGraph";

export interface NodeEditorState {
  graph: GraphJsonData;
  historyState: HistoryState;
}

export function createNodeEditorState(graph: GraphJsonData): NodeEditorState {
  return {
    graph: graph,
    historyState: initializeHistoryState(),
  };
}

export interface HistoryState {
  active: boolean;
  produced: any[];
  reserved: any[];
  limit?: number;
}

export function initializeHistoryState(): HistoryState {
  return {
    active: false,
    produced: [],
    reserved: [],
    limit: undefined,
  };
}

// memo:historyプラグインの状態は公開されていないので、直接アクセスする
export function getCurrentEditorState(
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>,
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>,
  groupPlugin: GroupPlugin<Schemes>
): NodeEditorState {
  return {
    graph: serializeGraph(editor, area, groupPlugin),
    historyState: {
      active: (history as any).history.active,
      produced: (history as any).history.produced.slice(),
      reserved: (history as any).history.reserved.slice(),
      limit: (history as any).history.limit,
    },
  };
}

export type ResetEditorStateParams = {
  payload: NodeEditorState;
  groupPlugin: GroupPlugin<Schemes>;
} & NodeDeps;

export async function resetEditorState({
  payload,
  editor,
  area,
  dataflow,
  controlflow,
  history,
  groupPlugin,
}: ResetEditorStateParams): Promise<void> {
  // 先にconnectionsを削除すると editor.clear() でエラーが起きない
  const connections = editor.getConnections();
  for (const conn of connections) {
    try {
      await editor.removeConnection(conn.id);
    } catch (error) {
      // connectionの情報を全部出して
      console.error(`Failed to remove connection ${conn.id}:`, error);
      console.warn("Connection info:", conn);
    }
  }
  // ノードのdestroyメソッドを呼び出す
  await destroyAllNodes(editor);
  // エディタをクリアしてからノードを再読み込み
  await editor.clear();
  history.clear();
  dataflow.reset();
  await deserializeGraphIntoEditor({
    graphJsonData: payload.graph,
    area,
    editor,
    dataflow,
    controlflow,
    history,
    groupPlugin,
  });
  updateHistoryState(history, payload);
  await AreaExtensions.zoomAt(area, editor.getNodes());
}

function updateHistoryState(
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>,
  payload: NodeEditorState
) {
  (history as any).history.active = payload.historyState.active;
  (history as any).history.produced = payload.historyState.produced.slice();
  (history as any).history.reserved = payload.historyState.reserved.slice();
  (history as any).history.limit = payload.historyState.limit;
}

export function patchHistoryAdd(
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>,
  callback: () => void
) {
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
}
