import {
  MultiLineStringNode,
  OpenAINode,
  OpenAIParamNode,
  RunNode,
  StringNode,
  TestNode,
  UnknownNode,
  ViewStringNode,
} from "./Node";
import type { AreaExtra, NodeTypes, Schemes } from "../types/Schemes";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine, ControlFlowEngine } from "rete-engine";
import type { HistoryPlugin, HistoryActions } from "rete-history-plugin";
import { ChatContextNode } from "./Node/OpenAI/ChatContextNode";

export type NodeDeps = {
  area: AreaPlugin<Schemes, AreaExtra>;
  dataflow: DataflowEngine<Schemes>;
  controlflow: ControlFlowEngine<Schemes>;
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>;
};

export const nodeFactories: Record<string, (deps: NodeDeps) => NodeTypes> = {
  UnknownNode: () => new UnknownNode(),
  String: ({ history, area, dataflow }) =>
    new StringNode("", history, area, dataflow),
  MultiLineString: ({ history, area, dataflow }) =>
    new MultiLineStringNode("", history, area, dataflow),
  Run: ({ controlflow }) => new RunNode(controlflow),
  ViewString: ({ dataflow, area }) => new ViewStringNode(dataflow, area),
  OpenAI: ({ area, dataflow, controlflow }) =>
    new OpenAINode(area, dataflow, controlflow),
  OpenAIParam: ({ history, area, dataflow }) =>
    new OpenAIParamNode(history, area, dataflow),
  ChatContext: ({ history, area, dataflow }) =>
    new ChatContextNode([], history, area, dataflow),
  Test: () => new TestNode(),
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
    label: "Primitive",
    key: "primitive-category",
    subitems: [
      {
        label: "Run",
        key: "run-node",
        factoryKey: "Run",
      },
      {
        label: "String",
        key: "string-node",
        factoryKey: "String",
      },
      {
        label: "Multi Line String",
        key: "multi-line-string-node",
        factoryKey: "MultiLineString",
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
    label: "OpenAI",
    key: "openai-category",
    subitems: [
      {
        label: "OpenAI Node",
        key: "openai-node",
        factoryKey: "OpenAI",
      },
      {
        label: "OpenAI Param",
        key: "openai-param-node",
        factoryKey: "OpenAIParam",
      },
      {
        label: "Chat Context",
        key: "chat-context-node",
        factoryKey: "ChatContext",
      },
    ],
  },
  {
    label: "Debug",
    key: "debug-category",
    subitems: [
      {
        label: "Unknown Node",
        key: "unknown-node",
        factoryKey: "UnknownNode",
      },
      {
        label: "Test Node",
        key: "test-node",
        factoryKey: "Test",
      },
    ],
  },
];
