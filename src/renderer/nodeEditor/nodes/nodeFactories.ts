import {
  MultiLineStringNode,
  NumberNode,
  OpenAINode,
  ResponseCreateParamsBaseNode,
  RunNode,
  StringNode,
  TestNode,
  UnknownNode,
  BoolNode,
  InspectorNode,
  ObjectPickNode,
  JsonSchemaToObjectNode,
  JsonSchemaNode,
  JsonSchemaFormatNode,
  ResponseTextConfigNode,
  TemplateReplaceNode,
  CreateSelectNode,
  ListDownloadedModelsNode,
  ModelInfoToModelListNode,
  LMStudioStartNode,
  LMStudioStopNode,
  ImageNode,
  LoadImageNode,
} from "./Node";
import type { AreaExtra, NodeTypes, Schemes } from "../types/Schemes";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine, ControlFlowEngine } from "rete-engine";
import type { HistoryPlugin, HistoryActions } from "rete-history-plugin";
import type { NodeEditor } from "rete";
import { ResponseInputMessageItemListNode } from "./Node/OpenAI/ChatContextNode";
import { ResponseInputMessageItemNode } from "./Node/OpenAI/ResponseInputMessageItemNode";
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
  Test: () => new TestNode(),
  Inspector: ({ dataflow, area, controlflow }) =>
    new InspectorNode(dataflow, area, controlflow),

  String: ({ history, area, dataflow }) =>
    new StringNode("", history, area, dataflow),
  MultiLineString: ({ history, area, dataflow }) =>
    new MultiLineStringNode("", history, area, dataflow),
  TemplateReplace: ({ area, dataflow, controlflow }) =>
    new TemplateReplaceNode(area, dataflow, controlflow),

  Number: ({ history, area, dataflow }) =>
    new NumberNode(0, history, area, dataflow),
  Bool: ({ history, area, dataflow }) => new BoolNode(history, area, dataflow),
  Run: ({ controlflow }) => new RunNode(controlflow),
  List: ({ area, dataflow }) => new ListNode(area, dataflow),
  CreateSelect: ({ area, dataflow, controlflow }) =>
    new CreateSelectNode(area, dataflow, controlflow),
  LoadImage: ({ history, area, dataflow }) =>
    new LoadImageNode(history, area, dataflow),
  Image: ({ area, dataflow, controlflow }) =>
    new ImageNode(area, dataflow, controlflow),

  // lmstudio nodes
  ListDownloadedModels: ({ area, dataflow, controlflow }) =>
    new ListDownloadedModelsNode(area, dataflow, controlflow),
  ModelInfoToModelList: () => new ModelInfoToModelListNode(),
  LMStudioStart: ({ area, controlflow }) =>
    new LMStudioStartNode(area, controlflow),
  LMStudioStop: ({ area, controlflow }) =>
    new LMStudioStopNode(area, controlflow),

  // OpenAI nodes
  OpenAI: ({ area, dataflow, controlflow }) =>
    new OpenAINode(area, dataflow, controlflow),
  ResponseCreateParamsBase: ({ history, area, dataflow }) =>
    new ResponseCreateParamsBaseNode(history, area, dataflow),
  ResponseInputMessageItemList: ({ history, area, dataflow, controlflow }) =>
    new ResponseInputMessageItemListNode(
      [],
      history,
      area,
      dataflow,
      controlflow
    ),
  ResponseInputMessageItem: ({ area, dataflow, controlflow, history }) =>
    new ResponseInputMessageItemNode(area, dataflow, controlflow, history),
  JsonSchemaFormat: ({ history, area, dataflow }) =>
    new JsonSchemaFormatNode(history, area, dataflow),
  ResponseTextConfig: () => new ResponseTextConfigNode(),

  ObjectPick: ({ area, dataflow }) => new ObjectPickNode(area, dataflow),
  JsonSchemaToObject: ({ editor, history, area, dataflow, controlflow }) =>
    new JsonSchemaToObjectNode(editor, history, area, dataflow, controlflow),
  JsonSchema: ({ history, area, dataflow }) =>
    new JsonSchemaNode(history, area, dataflow),

  IF: ({ history, area, dataflow }) => new IFNode(history, area, dataflow),
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
        label: "Load Image",
        key: "load-image-node",
        factoryKey: "LoadImage",
      },
      {
        label: "Create Select",
        key: "create-select-node",
        factoryKey: "CreateSelect",
      },
      {
        label: "Object Pick",
        key: "object-pick-node",
        factoryKey: "ObjectPick",
      },
      {
        label: "JsonSchemaToObject",
        key: "jsonschema-to-object-node",
        factoryKey: "JsonSchemaToObject",
      },
      {
        label: "JsonSchema",
        key: "jsonschema-node",
        factoryKey: "JsonSchema",
      },
      {
        label: "TemplateReplace",
        key: "template-replace",
        factoryKey: "TemplateReplace",
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
      {
        label: "Image",
        key: "image-node",
        factoryKey: "Image",
      },
    ],
  },
  {
    label: "OpenAI",
    key: "openai-category",
    subitems: [
      {
        label: "OpenAI",
        key: "openai-node",
        factoryKey: "OpenAI",
      },
      {
        label: "ResponseCreateParamsBase",
        key: "response-create-params-base-node",
        factoryKey: "ResponseCreateParamsBase",
      },
      {
        label: "ResponseInputMessageItemList",
        key: "response-input-message-item-list",
        factoryKey: "ResponseInputMessageItemList",
      },
      {
        label: "ResponseInputMessageItem",
        key: "response-input-message-item",
        factoryKey: "ResponseInputMessageItem",
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
    label: "LMStudio",
    key: "lmstudio-category",
    subitems: [
      {
        label: "List Downloaded Models",
        key: "list-downloaded-models-node",
        factoryKey: "ListDownloadedModels",
      },
      {
        label: "Model Info to Model List",
        key: "model-info-to-model-list-node",
        factoryKey: "ModelInfoToModelList",
      },
      {
        label: "Start Server",
        key: "lmstudio-start-node",
        factoryKey: "LMStudioStart",
      },
      {
        label: "Stop Server",
        key: "lmstudio-stop-node",
        factoryKey: "LMStudioStop",
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
