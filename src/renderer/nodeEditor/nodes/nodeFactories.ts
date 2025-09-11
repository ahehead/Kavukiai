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
  CodeFenceNode,
  ComfyDesktopStartNode,
  ComfyUIFreeMemoryNode,
  ComfyUINode,
  CounterLoopNode,
  CreateSelectNode,
  GetModelInfoListNode,
  InspectorNode,
  JoinNode,
  JsonFilePathNode,
  JsonSchemaFormatNode,
  JsonSchemaNode,
  JsonSchemaToObjectNode,
  ListDownloadedModelsNode,
  LLMPredictionConfigNode,
  LMStudioChatNode,
  LMStudioLoadModelNode,
  LMStudioStartNode,
  LMStudioStopNode,
  LoadWorkflowFileNode,
  MergeWorkflowInputsDefaultsNode,
  ModelInfoToModelListNode,
  MultiLineStringNode,
  NumberNode,
  NumberToStringNode,
  ObjectPickNode,
  ObjectToStringNode,
  ObjectToYAMLStringNode,
  OpenAINode,
  PrepareWorkflowPromptNode,
  ResponseCreateParamsBaseNode,
  ResponseTextConfigNode,
  RunNode,
  SelectImageNode,
  ServerStatusNode,
  ShowImageNode,
  StringFormNode,
  StringNode,
  TemplateReplaceNode,
  TemplateWorkflowListNode,
  TestNode,
  UChatMessageByStringNode,
  UChatNode,
  UnknownNode,
  UnLoadModelNode,
  UserWorkflowListNode,
  WorkflowInputsNode,
  WorkflowOutputsNode,
} from "./Node";
import { OpenAIToUChatCommandNode } from "./Node/Chat/OpenAIToUChatCommandNode";
import { ReverseRoleNode } from "./Node/Chat/ReverseRoleNode";
import { UChatGetLastMessageNode } from "./Node/Chat/UChatGetLastMessageNode";
import { UChatMessageNode } from "./Node/Chat/UChatMessageNode";
import { UChatRoleNode } from "./Node/Chat/UChatRoleNode";
import { UChatToLMStudioNode } from "./Node/Chat/UChatToLMStudioNode";
import { UChatToOpenAINode } from "./Node/Chat/UChatToOpenAINode";
import { UChatToStringNode } from "./Node/Chat/UChatToStringNode";
import { UPartTextNode } from "./Node/Chat/UPartTextNode";
import { ArrayNode } from "./Node/Primitive/ArrayNode";
import { IFNode } from "./Node/Primitive/Flow/IFNode";

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
  TemplateReplace: ({ dataflow, controlflow }) =>
    new TemplateReplaceNode(dataflow, controlflow),
  JsonFilePath: ({ history, area, dataflow }) =>
    new JsonFilePathNode("", history, area, dataflow),
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

  Array: ({ area, dataflow }) => new ArrayNode(area, dataflow),
  CreateSelect: ({ dataflow, controlflow }) =>
    new CreateSelectNode(dataflow, controlflow),
  SelectImage: ({ history, area, dataflow }) =>
    new SelectImageNode(history, area, dataflow),
  ShowImage: ({ area, dataflow, controlflow }) =>
    new ShowImageNode(area, dataflow, controlflow),

  // lmstudio nodes
  ListDownloadedModels: ({ dataflow, controlflow }) =>
    new ListDownloadedModelsNode(dataflow, controlflow),
  GetModelInfoList: ({ dataflow, controlflow }) =>
    new GetModelInfoListNode(dataflow, controlflow),
  ModelInfoToModelList: () => new ModelInfoToModelListNode(),
  LMStudioChat: ({ area, dataflow, controlflow }) =>
    new LMStudioChatNode(area, dataflow, controlflow),
  LMStudioStart: ({ controlflow }) => new LMStudioStartNode(controlflow),
  LMStudioStop: ({ controlflow }) => new LMStudioStopNode(controlflow),
  LMStudioLoadModel: ({ area, dataflow, controlflow }) =>
    new LMStudioLoadModelNode(area, dataflow, controlflow),
  ServerStatus: ({ dataflow, controlflow }) =>
    new ServerStatusNode(dataflow, controlflow),
  UnLoadModel: ({ controlflow }) => new UnLoadModelNode(controlflow),
  LLMPredictionConfig: ({ dataflow }) => new LLMPredictionConfigNode(dataflow),

  // ComfyUI
  ComfyUI: ({ area, dataflow, controlflow }) =>
    new ComfyUINode(area, dataflow, controlflow),
  ComfyDesktopStart: ({ area, dataflow, controlflow }) =>
    new ComfyDesktopStartNode(area, dataflow, controlflow),
  ComfyUIFreeMemory: ({ area, history, dataflow, controlflow }) =>
    new ComfyUIFreeMemoryNode(area, history, dataflow, controlflow),
  PrepareWorkflowPrompt: ({ area, history, dataflow, controlflow }) =>
    new PrepareWorkflowPromptNode(area, history, dataflow, controlflow),
  LoadWorkflowFile: ({ area, dataflow, controlflow }) =>
    new LoadWorkflowFileNode(area, dataflow, controlflow),
  TemplateWorkflowList: ({ area, history, dataflow, controlflow }) =>
    new TemplateWorkflowListNode(area, history, dataflow, controlflow),
  UserWorkflowList: ({ history, dataflow, controlflow }) =>
    new UserWorkflowListNode(history, dataflow, controlflow),
  WorkflowInputs: ({ history, area, dataflow, controlflow }) =>
    new WorkflowInputsNode(history, area, dataflow, controlflow),
  WorkflowOutputs: ({ history, area, dataflow, controlflow }) =>
    new WorkflowOutputsNode(history, area, dataflow, controlflow),
  MergeWorkflowInputsDefaults: () => new MergeWorkflowInputsDefaultsNode(),

  // OpenAI nodes
  OpenAI: ({ area, dataflow, controlflow }) =>
    new OpenAINode(area, dataflow, controlflow),
  ResponseCreateParamsBase: ({ history, area, dataflow }) =>
    new ResponseCreateParamsBaseNode(history, area, dataflow),
  JsonSchemaFormat: ({ history, area, dataflow }) =>
    new JsonSchemaFormatNode(history, area, dataflow),
  ResponseTextConfig: () => new ResponseTextConfigNode(),

  // chat
  UChatToString: () => new UChatToStringNode(),
  UChatGetLastMessage: () => new UChatGetLastMessageNode(),
  OpenAIToUChatCommand: () => new OpenAIToUChatCommandNode(),
  UChatMessage: () => new UChatMessageNode(),
  UChatMessageByString: () => new UChatMessageByStringNode(),
  UPartText: ({ history, area, dataflow }) =>
    new UPartTextNode("", history, area, dataflow),
  UChatToOpenAI: () => new UChatToOpenAINode(),
  UChatToLMStudio: () => new UChatToLMStudioNode(),
  UChat: ({ history, area, dataflow, controlflow }) =>
    new UChatNode([], history, area, dataflow, controlflow),
  UChatRole: ({ history, area, dataflow }) =>
    new UChatRoleNode("user", history, area, dataflow),
  ReverseRole: () => new ReverseRoleNode(),

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
      { label: "Array", factoryKey: "Array" },
      { label: "Number", factoryKey: "Number" },
      {
        label: "String",
        subitems: [
          { label: "String", factoryKey: "String" },
          { label: "MultiLineString", factoryKey: "MultiLineString" },
          { label: "TemplateReplace", factoryKey: "TemplateReplace" },
          { label: "JsonFilePath", factoryKey: "JsonFilePath" },
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
          { label: "SelectImage", factoryKey: "SelectImage" },
          { label: "ShowImage", factoryKey: "ShowImage" },
        ],
      },
    ],
  },
  {
    label: "UChat",
    subitems: [
      { label: "UChat", factoryKey: "UChat" },
      { label: "UChatMessage", factoryKey: "UChatMessage" },
      { label: "UChatMessageByString", factoryKey: "UChatMessageByString" },
      { label: "UChatRole", factoryKey: "UChatRole" },
      { label: "UPartText", factoryKey: "UPartText" },
      { label: "UChatToString", factoryKey: "UChatToString" },
      { label: "UChatGetLastMessage", factoryKey: "UChatGetLastMessage" },
      { label: "UChatToOpenAI", factoryKey: "UChatToOpenAI" },
      { label: "UChatToLMStudio", factoryKey: "UChatToLMStudio" },
      { label: "OpenAIToUChatCommand", factoryKey: "OpenAIToUChatCommand" },
      { label: "ReverseRole", factoryKey: "ReverseRole" },
    ],
  },
  { label: "Inspector", factoryKey: "Inspector" },
  {
    label: "LMStudio",
    subitems: [
      { label: "ListDownloadedModels", factoryKey: "ListDownloadedModels" },
      { label: "GetModelInfoList", factoryKey: "GetModelInfoList" },
      { label: "ModelInfoToModelList", factoryKey: "ModelInfoToModelList" },
      { label: "LMStudioChat", factoryKey: "LMStudioChat" },
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
  {
    label: "ComfyUI",
    subitems: [
      { label: "ComfyUI", factoryKey: "ComfyUI" },
      { label: "ComfyDesktopStart", factoryKey: "ComfyDesktopStart" },
      { label: "ComfyUIFreeMemory", factoryKey: "ComfyUIFreeMemory" },
      { label: "PrepareWorkflowPrompt", factoryKey: "PrepareWorkflowPrompt" },
      { label: "LoadWorkflowFile", factoryKey: "LoadWorkflowFile" },
      { label: "TemplateWorkflowList", factoryKey: "TemplateWorkflowList" },
      { label: "UserWorkflowList", factoryKey: "UserWorkflowList" },
      { label: "WorkflowInputs", factoryKey: "WorkflowInputs" },
      { label: "WorkflowOutputs", factoryKey: "WorkflowOutputs" },
      {
        label: "MergeWorkflowInputsDefaults",
        factoryKey: "MergeWorkflowInputsDefaults",
      },
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
