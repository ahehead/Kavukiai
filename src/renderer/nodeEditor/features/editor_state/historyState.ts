import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine, ControlFlowEngine } from "rete-engine";
import type { HistoryActions, HistoryPlugin } from "rete-history-plugin";
import { serializeGraph } from "../serializeGraph/serializeGraph";
import { loadGraphFromJson } from "../loadGraphFromJson/loadGraphFromJson";
import { AreaExtensions } from "rete-area-plugin";
import type { AreaExtra, Schemes } from "../../types/Schemes";
import type { GraphJsonData } from "shared/JsonType";

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
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>
): NodeEditorState {
  return {
    graph: serializeGraph(editor, area),
    historyState: {
      active: (history as any).history.active,
      produced: (history as any).history.produced.slice(),
      reserved: (history as any).history.reserved.slice(),
      limit: (history as any).history.limit,
    },
  };
}

interface ResetEditorStateParams {
  payload: NodeEditorState;
  editor: NodeEditor<Schemes>;
  area: AreaPlugin<Schemes, AreaExtra>;
  dataflow: DataflowEngine<Schemes>;
  controlflow: ControlFlowEngine<Schemes>;
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>;
}

export async function resetEditorState({
  payload,
  editor,
  area,
  dataflow,
  controlflow,
  history,
}: ResetEditorStateParams): Promise<void> {
  await editor.clear();
  history.clear();
  dataflow.reset();
  await loadGraphFromJson(
    payload.graph,
    area,
    editor,
    dataflow,
    controlflow,
    history
  );
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
