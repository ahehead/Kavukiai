import {
  MultiLineStringNode,
  OpenAINode,
  OpenAIResponseParamNode,
  RunNode,
  StringNode,
  ViewStringNode,
} from "./Node";
import type { AreaExtra, NodeTypes, Schemes } from "../types/Schemes";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine, ControlFlowEngine } from "rete-engine";
import type { HistoryPlugin, HistoryActions } from "rete-history-plugin";
import { ChatContextNode } from "./Node/ChatContextNode";

export type NodeDeps = {
  area: AreaPlugin<Schemes, AreaExtra>;
  dataflow: DataflowEngine<Schemes>;
  controlflow: ControlFlowEngine<Schemes>;
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>;
};

export const nodeFactories: Record<string, (deps: NodeDeps) => NodeTypes> = {
  String: ({ history, area, dataflow }) =>
    new StringNode("", history, area, dataflow),
  MultiLineString: ({ history, area, dataflow }) =>
    new MultiLineStringNode("", history, area, dataflow),
  Run: ({ controlflow }) => new RunNode(controlflow),
  ViewString: ({ dataflow, area }) => new ViewStringNode(dataflow, area),
  OpenAI: ({ area, dataflow }) => new OpenAINode(area, dataflow),
  OpenAIResponseParam: ({ history, area, dataflow }) =>
    new OpenAIResponseParamNode(history, area, dataflow),
  ChatContext: ({ history, area, dataflow }) =>
    new ChatContextNode([], history, area, dataflow),
};

export interface MenuItemDefinition {
  label: string;
  key: string;
  handler?: () => void;
  factoryKey?: keyof typeof nodeFactories; // nodeFactories のキーを参照
  subitems?: MenuItemDefinition[];
}

export const contextMenuStructure: MenuItemDefinition[] = [
  {
    label: "Input",
    key: "input-category",
    subitems: [
      { label: "String", key: "string-node", factoryKey: "String" },
      {
        label: "Multi Line String",
        key: "multi-line-string-node",
        factoryKey: "MultiLineString",
      },
      {
        label: "Chat Context",
        key: "chat-context-node",
        factoryKey: "ChatContext",
      },
    ],
  },
  {
    label: "Output",
    key: "output-category",
    subitems: [
      {
        label: "View String",
        key: "view-string-node",
        factoryKey: "ViewString",
      },
    ],
  },
  {
    label: "Control",
    key: "control-category",
    subitems: [{ label: "Run", key: "run-node", factoryKey: "Run" }],
  },
  {
    label: "OpenAI",
    key: "openai-category",
    subitems: [
      { label: "OpenAI Node", key: "openai-node", factoryKey: "OpenAI" },
      {
        label: "Response Param",
        key: "openai-response-param-node",
        factoryKey: "OpenAIResponseParam",
      },
    ],
  },
];
