import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine } from "rete-engine";
import type { HistoryActions, HistoryPlugin } from "rete-history-plugin";
import type { DataflowEngine } from "../features/safe-dataflow/dataflowEngin";
import type {
  AreaExtra,
  NodeTypeKey,
  NodeTypes,
  Schemes,
} from "../types/Schemes";
import {
  BoolNode,
  ChatMessageNode,
  CodeFenceNode,
  CounterLoopNode,
  CreateSelectNode,
  ImageNode,
  InspectorNode,
  JoinNode,
  JsonSchemaFormatNode,
  JsonSchemaNode,
  JsonSchemaToObjectNode,
  ListDownloadedModelsNode,
  LLMPredictionConfigNode,
  LMStudioLoadModelNode,
  LMStudioStartNode,
  LMStudioStopNode,
  LoadImageNode,
  ModelInfoToModelListNode,
  MultiLineStringNode,
  NumberNode,
  NumberToStringNode,
  ObjectPickNode,
  ObjectToStringNode,
  ObjectToYAMLStringNode,
  OpenAINode,
  ResponseCreateParamsBaseNode,
  ResponseTextConfigNode,
  RoleNode,
  RunNode,
  ServerStatusNode,
  StringFormNode,
  StringNode,
  TemplateReplaceNode,
  TestNode,
  UnknownNode,
  UnLoadModelNode,
} from "./Node";
import { ChatMessageListNode } from "./Node/Chat/ChatContextNode";
import { ChatMessageListToOpenAIInput } from "./Node/Chat/ChatMessageListToOpenAIInput";
import { ChatMessageListToStringNode } from "./Node/Chat/ChatMessageListToStringNode";
import { GetLastMessageNode } from "./Node/Chat/GetLastMessageNode";
import { OpenAIToChatEventNode } from "./Node/Chat/OpenAIToChatEventNode";
import { ReverseUserAssistantRoleNode } from "./Node/Chat/ReverseUserAssistantRoleNode";
import { IFNode } from "./Node/Primitive/Flow/IFNode";
import { ListNode } from "./Node/Primitive/ListNode";

export type NodeDeps = {
  editor: NodeEditor<Schemes>;
  area: AreaPlugin<Schemes, AreaExtra>;
  dataflow: DataflowEngine<Schemes>;
  controlflow: ControlFlowEngine<Schemes>;
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>;
  message?: string;
};

export const nodeFactories = {
  Unknown: ({ message }) => new UnknownNode(message),
  Test: () => new TestNode(),
  Inspector: ({ dataflow, area, controlflow }) =>
    new InspectorNode(dataflow, area, controlflow),

  String: ({ history, area, dataflow }) =>
    new StringNode("", history, area, dataflow),
  MultiLineString: ({ history, area, dataflow }) =>
    new MultiLineStringNode("", history, area, dataflow),
  TemplateReplace: ({ area, dataflow, controlflow }) =>
    new TemplateReplaceNode(area, dataflow, controlflow),
  StringForm: ({ history, area, dataflow, controlflow }: NodeDeps) =>
    new StringFormNode("", history, area, dataflow, controlflow),
  Join: ({ dataflow }) => new JoinNode(dataflow),
  NumberToString: () => new NumberToStringNode(),
  ObjectToString: () => new ObjectToStringNode(),
  ObjectToYAMLString: () => new ObjectToYAMLStringNode(),
  CodeFence: ({ dataflow }) => new CodeFenceNode(dataflow),

  Number: ({ history, area, dataflow }) =>
    new NumberNode(0, history, area, dataflow),
  Bool: ({ history, area, dataflow }) => new BoolNode(history, area, dataflow),

  List: ({ area, dataflow }) => new ListNode(area, dataflow),
  CreateSelect: ({ dataflow, controlflow }) =>
    new CreateSelectNode(dataflow, controlflow),
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
  LMStudioLoadModel: ({ area, dataflow, controlflow }) =>
    new LMStudioLoadModelNode(area, dataflow, controlflow),
  ServerStatus: ({ area, dataflow, controlflow }) =>
    new ServerStatusNode(area, dataflow, controlflow),
  UnLoadModel: ({ area, controlflow }) =>
    new UnLoadModelNode(area, controlflow),
  LLMPredictionConfig: ({ dataflow }) => new LLMPredictionConfigNode(dataflow),

  // OpenAI nodes
  OpenAI: ({ area, dataflow, controlflow }) =>
    new OpenAINode(area, dataflow, controlflow),
  ResponseCreateParamsBase: ({ history, area, dataflow }) =>
    new ResponseCreateParamsBaseNode(history, area, dataflow),
  JsonSchemaFormat: ({ history, area, dataflow }) =>
    new JsonSchemaFormatNode(history, area, dataflow),
  ResponseTextConfig: () => new ResponseTextConfigNode(),

  // chat
  ChatMessageListToOpenAIInput: () => new ChatMessageListToOpenAIInput(),
  ChatMessageListToString: () => new ChatMessageListToStringNode(),
  GetLastMessage: () => new GetLastMessageNode(),
  ReverseUserAssistantRole: () => new ReverseUserAssistantRoleNode(),
  OpenAIToChatEvent: () => new OpenAIToChatEventNode(),
  ChatMessageList: ({ history, area, dataflow, controlflow }) =>
    new ChatMessageListNode([], history, area, dataflow, controlflow),
  ChatMessage: () => new ChatMessageNode(),
  Role: ({ history, area, dataflow }) =>
    new RoleNode("user", history, area, dataflow),

  ObjectPick: ({ area, dataflow }) => new ObjectPickNode(area, dataflow),
  JsonSchemaToObject: ({ editor, history, area, dataflow, controlflow }) =>
    new JsonSchemaToObjectNode(editor, history, area, dataflow, controlflow),
  JsonSchema: ({ history, area, dataflow }) =>
    new JsonSchemaNode(history, area, dataflow),

  // flow
  IF: ({ history, area, dataflow }) => new IFNode(history, area, dataflow),
  Run: ({ controlflow }) => new RunNode(controlflow),
  CounterLoop: ({ history, area, dataflow, controlflow }) =>
    new CounterLoopNode(1, history, area, dataflow, controlflow),
} satisfies Record<NodeTypeKey, (deps: NodeDeps) => NodeTypes>;

export interface MenuItemDefinition {
  label: string;
  key: string;
  handler?: () => void;
  factoryKey?: NodeTypeKey;
  subitems?: MenuItemDefinition[];
}

// types for building raw menu without keys
type RawMenuItem = {
  label: string;
  factoryKey?: NodeTypeKey;
  subitems?: RawMenuItem[];
};
// generate key from label
const generateKey = (label: string): string =>
  label.toLowerCase().replace(/\s+/g, "-");

// raw menu structure without explicit keys
const rawMenu: RawMenuItem[] = [
  {
    label: "Primitive",
    subitems: [
      { label: "Bool", factoryKey: "Bool" },
      { label: "CreateSelect", factoryKey: "CreateSelect" },
      { label: "List", factoryKey: "List" },
      { label: "Number", factoryKey: "Number" },
      {
        label: "String",
        subitems: [
          { label: "String", factoryKey: "String" },
          { label: "MultiLineString", factoryKey: "MultiLineString" },
          { label: "TemplateReplace", factoryKey: "TemplateReplace" },
          { label: "Join", factoryKey: "Join" },
          { label: "StringForm", factoryKey: "StringForm" },
          { label: "NumberToString", factoryKey: "NumberToString" },
          { label: "ObjectToString", factoryKey: "ObjectToString" },
          { label: "ObjectToYAMLString", factoryKey: "ObjectToYAMLString" },
          { label: "CodeFence", factoryKey: "CodeFence" },
        ],
      },
      {
        label: "Object",
        subitems: [
          { label: "JsonSchema", factoryKey: "JsonSchema" },
          { label: "JsonSchemaToObject", factoryKey: "JsonSchemaToObject" },
          { label: "ObjectPick", factoryKey: "ObjectPick" },
        ],
      },
      {
        label: "Flow",
        subitems: [
          { label: "IF", factoryKey: "IF" },
          { label: "Run", factoryKey: "Run" },
          { label: "CounterLoop", factoryKey: "CounterLoop" },
        ],
      },
      {
        label: "Image",
        subitems: [
          { label: "LoadImage", factoryKey: "LoadImage" },
          { label: "Image", factoryKey: "Image" },
        ],
      },
    ],
  },
  {
    label: "Chat",
    subitems: [
      {
        label: "ChatMessage",
        factoryKey: "ChatMessage",
      },
      { label: "ChatMessageList", factoryKey: "ChatMessageList" },
      {
        label: "ChatMessageListToOpenAIInput",
        factoryKey: "ChatMessageListToOpenAIInput",
      },
      {
        label: "ChatMessageListToString",
        factoryKey: "ChatMessageListToString",
      },
      { label: "GetLastMessage", factoryKey: "GetLastMessage" },
      {
        label: "ReverseUserAssistantRole",
        factoryKey: "ReverseUserAssistantRole",
      },
      { label: "Role", factoryKey: "Role" },
      { label: "OpenAIToChatEvent", factoryKey: "OpenAIToChatEvent" },
    ],
  },
  { label: "Inspector", factoryKey: "Inspector" },
  {
    label: "LMStudio",
    subitems: [
      { label: "ListDownloadedModels", factoryKey: "ListDownloadedModels" },
      { label: "ModelInfoToModelList", factoryKey: "ModelInfoToModelList" },
      { label: "LMStudioStart", factoryKey: "LMStudioStart" },
      { label: "LMStudioStop", factoryKey: "LMStudioStop" },
      { label: "LMStudioLoadModel", factoryKey: "LMStudioLoadModel" },
      { label: "UnLoadModel", factoryKey: "UnLoadModel" },
      { label: "ServerStatus", factoryKey: "ServerStatus" },
      { label: "LLMPredictionConfig", factoryKey: "LLMPredictionConfig" },
    ],
  },
  {
    label: "OpenAI",
    subitems: [
      { label: "OpenAI", factoryKey: "OpenAI" },
      {
        label: "ResponseCreateParamsBase",
        factoryKey: "ResponseCreateParamsBase",
      },
      { label: "JsonSchemaFormat", factoryKey: "JsonSchemaFormat" },

      { label: "ResponseTextConfig", factoryKey: "ResponseTextConfig" },
    ],
  },
  // include Debug category only in development, placed at bottom
  ...(process.env.NODE_ENV === "development"
    ? ([
        {
          label: "Debug",
          subitems: [
            { label: "Test", factoryKey: "Test" },
            { label: "Unknown", factoryKey: "Unknown" },
          ],
        },
      ] as RawMenuItem[])
    : []),
];

// assign keys and sort items with subitems first
function assignKeys(items: RawMenuItem[]): MenuItemDefinition[] {
  return items
    .map((item) => ({
      ...item,
      key: generateKey(item.label),
      subitems: item.subitems ? assignKeys(item.subitems) : undefined,
    }))
    .sort((a, b) => (b.subitems ? 1 : 0) - (a.subitems ? 1 : 0));
}

export const contextMenuStructure = assignKeys(rawMenu);
