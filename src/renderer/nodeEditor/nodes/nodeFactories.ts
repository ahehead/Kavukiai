import {
  MultiLineStringNode,
  OpenAINode,
  OpenAIResponseParamNode,
  RunNode,
  StringNode,
  ViewStringNode,
} from "./Node";
import type { AreaExtra, NodeTypes, Schemes } from "../types";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine, ControlFlowEngine } from "rete-engine";
import type { HistoryPlugin, HistoryActions } from "rete-history-plugin";

export type NodeDeps = {
  area: AreaPlugin<Schemes, AreaExtra>;
  dataflow: DataflowEngine<Schemes>;
  controlflow: ControlFlowEngine<Schemes>;
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>;
};

export const nodeFactories: Record<string, (deps: NodeDeps) => NodeTypes> = {
  String: () => new StringNode(""),
  MultiLineString: ({ history, area, dataflow }) =>
    new MultiLineStringNode("", history, area, dataflow),
  Run: ({ controlflow }) => new RunNode(controlflow),
  ViewString: ({ dataflow, area }) => new ViewStringNode(dataflow, area),
  OpenAI: ({ area, dataflow }) => new OpenAINode(area, dataflow),
  OpenAIResponseParam: ({ history, area, dataflow }) =>
    new OpenAIResponseParamNode(history, area, dataflow),
};
