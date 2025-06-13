import {
  MultiLineStringNode,
  NumberNode,
  OpenAINode,
  OpenAIParamNode,
  RunNode,
  StringNode,
  TestNode,
  UnknownNode,
  BoolNode,
  InspectorNode,
  ObjectPickNode,
  TSchemaNode,
  JsonSchemaFormatNode,
  ResponseTextConfigNode,
} from "./Node";
import type { AreaExtra, NodeTypes, Schemes } from "../types/Schemes";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine, ControlFlowEngine } from "rete-engine";
import type { HistoryPlugin, HistoryActions } from "rete-history-plugin";
import type { NodeEditor } from "rete";
import { ResponseInputMessageItemListNode } from "./Node/OpenAI/ChatContextNode";
import { IFNode } from "./Node/Flow/IFNode";
import { ListNode } from "./Node/Primitive/ListNode";

export type NodeDeps = {
  editor: NodeEditor<Schemes>;
  area: AreaPlugin<Schemes, AreaExtra>;
  dataflow: DataflowEngine<Schemes>;
  controlflow: ControlFlowEngine<Schemes>;
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>;
};

export const nodeFactories: Record<string, (deps: NodeDeps) => NodeTypes> = {
  UnknownNode: () => new UnknownNode(),
  String: ({ history, area, dataflow }) =>
    new StringNode("", history, area, dataflow),
  Number: ({ history, area, dataflow }) =>
    new NumberNode(0, history, area, dataflow),
  Bool: ({ history, area, dataflow }) => new BoolNode(history, area, dataflow),
  MultiLineString: ({ history, area, dataflow }) =>
    new MultiLineStringNode("", history, area, dataflow),
  Run: ({ controlflow }) => new RunNode(controlflow),
  Inspector: ({ editor, dataflow, area, controlflow }) =>
    new InspectorNode(editor, dataflow, area, controlflow),
  OpenAI: ({ area, dataflow, controlflow }) =>
    new OpenAINode(area, dataflow, controlflow),
  OpenAIParam: ({ history, area, dataflow }) =>
    new OpenAIParamNode(history, area, dataflow),
  ResponseInputMessageItemList: ({ history, area, dataflow }) =>
    new ResponseInputMessageItemListNode([], history, area, dataflow),
  Test: () => new TestNode(),
  List: ({ area, dataflow }) => new ListNode(area, dataflow),
  ObjectPick: ({ area, dataflow }) => new ObjectPickNode(area, dataflow),
  TSchema: ({ history, area, dataflow }) =>
    new TSchemaNode(history, area, dataflow),
  IF: ({ history, area, dataflow }) => new IFNode(history, area, dataflow),
  JsonSchemaFormat: ({ area, dataflow }) => new JsonSchemaFormatNode(area, dataflow),
  ResponseTextConfig: ({ area, dataflow }) => new ResponseTextConfigNode(area, dataflow),
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
        label: "Number",
        key: "number-node",
        factoryKey: "Number",
      },
      {
        label: "Multi Line String",
        key: "multi-line-string-node",
        factoryKey: "MultiLineString",
      },
      {
        label: "Bool",
        key: "bool-node",
        factoryKey: "Bool",
      },
      {
        label: "List",
        key: "list-node",
        factoryKey: "List",
      },
      {
        label: "Object Pick",
        key: "object-pick-node",
        factoryKey: "ObjectPick",
      },
      {
        label: "TSchema",
        key: "tschema-node",
        factoryKey: "TSchema",
      },
    ],
  },
  {
    label: "Flow",
    key: "flow-category",
    subitems: [
      {
        label: "IF",
        key: "if-node",
        factoryKey: "IF",
      },
    ],
  },
  {
    label: "Output",
    key: "output-category",
    subitems: [
      {
        label: "Inspector",
        key: "inspector-node",
        factoryKey: "Inspector",
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
        label: "ResponseInputMessageItemList",
        key: "response-input-message-item-list",
        factoryKey: "ResponseInputMessageItemList",
      },
      {
        label: "JsonSchema Format",
        key: "jsonschema-format-node",
        factoryKey: "JsonSchemaFormat",
      },
      {
        label: "Response Text Config",
        key: "response-text-config-node",
        factoryKey: "ResponseTextConfig",
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
