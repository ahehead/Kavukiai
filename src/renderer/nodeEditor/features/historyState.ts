import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine, ControlFlowEngine } from "rete-engine";
import type { HistoryActions, HistoryPlugin } from "rete-history-plugin";
import { exportGraph } from "shared/exportGraph";
import { createNodes } from "./createGraph/createNodes";
import { AreaExtensions } from "rete-area-plugin";
import type { AreaExtra, Schemes } from "../types";
import type { GraphJsonData } from "shared/JsonType";

export interface HistoryState {
  graph: GraphJsonData;
  active: boolean;
  produced: any[];
  reserved: any[];
  limit?: number;
}

export function extractHistoryState(
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>,
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>
): HistoryState {
  return {
    graph: exportGraph(editor, area),
    active: (history as any).history.active,
    produced: (history as any).history.produced.slice(),
    reserved: (history as any).history.reserved.slice(),
    limit: (history as any).history.limit,
  };
}

export async function restoreHistoryState(
  state: HistoryState,
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>,
  dataflow: DataflowEngine<Schemes>,
  engine: ControlFlowEngine<Schemes>,
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>
): Promise<void> {
  await editor.clear();
  history.clear();
  await createNodes(state.graph, area, editor, dataflow, engine, history);
  (history as any).history.active = state.active;
  (history as any).history.produced = state.produced.slice();
  (history as any).history.reserved = state.reserved.slice();
  (history as any).history.limit = state.limit;
  await AreaExtensions.zoomAt(area, editor.getNodes());
}

/**
 * 初期化された HistoryState を返す
 */
export function createInitialHistoryState(graph: GraphJsonData): HistoryState {
  return {
    graph: graph,
    active: false,
    produced: [],
    reserved: [],
    limit: undefined,
  };
}
