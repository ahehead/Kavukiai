import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine, ControlFlowEngine } from "rete-engine";
import type { HistoryActions, HistoryPlugin } from "rete-history-plugin";
import { exportGraph } from "../exportGraphJson/exportGraph";
import { createNodes } from "../createGraph/createNodes";
import { AreaExtensions } from "rete-area-plugin";
import type { AreaExtra, Schemes } from "../../types";
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

// memo:historyプラグインの状態は公開されていないので、無理やり取得する
export interface HistoryState {
  active: boolean;
  produced: any[];
  reserved: any[];
  limit?: number;
}

export function getCurrentEditorState(
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>,
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>
): NodeEditorState {
  return {
    graph: exportGraph(editor, area),
    historyState: {
      active: (history as any).history.active,
      produced: (history as any).history.produced.slice(),
      reserved: (history as any).history.reserved.slice(),
      limit: (history as any).history.limit,
    },
  };
}

export function initializeHistoryState(): HistoryState {
  return {
    active: false,
    produced: [],
    reserved: [],
    limit: undefined,
  };
}

export async function resetEditorState(
  payload: NodeEditorState,
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>,
  dataflow: DataflowEngine<Schemes>,
  engine: ControlFlowEngine<Schemes>,
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>
): Promise<void> {
  await editor.clear();
  history.clear();
  dataflow.reset();
  await createNodes(payload.graph, area, editor, dataflow, engine, history);
  setHistoryState(history, payload);
  await AreaExtensions.zoomAt(area, editor.getNodes());
}

function setHistoryState(
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>,
  payload: NodeEditorState
) {
  (history as any).history.active = payload.historyState.active;
  (history as any).history.produced = payload.historyState.produced.slice();
  (history as any).history.reserved = payload.historyState.reserved.slice();
  (history as any).history.limit = payload.historyState.limit;
}
