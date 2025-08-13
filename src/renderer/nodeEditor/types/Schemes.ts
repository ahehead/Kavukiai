import type { GetSchemes } from "rete";
import type { ContextMenuExtra } from "rete-context-menu-plugin";
import type { ReactArea2D } from "rete-react-plugin";

import type {
  ArrayNode,
  BoolNode,
  ChatMessageListNode,
  ChatMessageNode,
  CodeFenceNode,
  ComfyUINode,
  CounterLoopNode,
  CreateSelectNode,
  GetLastMessageNode,
  IFNode,
  InspectorNode,
  JoinNode,
  JsonSchemaFormatNode,
  JsonSchemaNode,
  JsonSchemaToObjectNode,
  ListDownloadedModelsNode,
  LLMPredictionConfigNode,
  LMStudioChatNode,
  LMStudioLoadModelNode,
  LMStudioStartNode,
  LMStudioStopNode,
  LMStudioToUChatCommandNode,
  LoadWorkflowNode,
  ModelInfoToModelListNode,
  MultiLineStringNode,
  NumberNode,
  NumberToStringNode,
  ObjectPickNode,
  ObjectToStringNode,
  ObjectToYAMLStringNode,
  OpenAINode,
  OpenAIToChatEventNode,
  OpenAIToUChatCommandNode,
  ResponseCreateParamsBaseNode,
  ResponseTextConfigNode,
  ReverseRoleNode,
  RoleNode,
  RunNode,
  SelectImageNode,
  ServerStatusNode,
  ShowImageNode,
  StringFormNode,
  StringNode,
  TemplateReplaceNode,
  TestNode,
  UChatGetLastMessageNode,
  UChatMessageNode,
  UChatNode,
  UChatRoleNode,
  UChatToLMStudioNode,
  UChatToOpenAINode,
  UChatToStringNode,
  UnknownNode,
  UnLoadModelNode,
  UPartTextNode,
  WorkflowInputsNode,
} from "../nodes/Node";
import type { Connection } from "./Connection";
import type { BaseNode } from "./Node/BaseNode";
import type { NodeControl } from "./NodeControl";
import type { TypedSocket } from "./TypedSocket";

export type AreaExtra = ReactArea2D<Schemes> | ContextMenuExtra;

export type Schemes = GetSchemes<
  NodeTypes,
  Connection<NodeInterface, NodeInterface>
>;

export type NodeTypes =
  | UnknownNode
  | TestNode
  | StringNode
  | NumberNode
  | RunNode
  | MultiLineStringNode
  | InspectorNode
  | OpenAINode
  | ResponseCreateParamsBaseNode
  | ChatMessageListNode
  | UChatToStringNode
  | UChatGetLastMessageNode
  | GetLastMessageNode
  | ChatMessageNode
  | RoleNode
  | UChatMessageNode
  | UPartTextNode
  | BoolNode
  | IFNode
  | CounterLoopNode
  | ArrayNode
  | ObjectPickNode
  | JsonSchemaToObjectNode
  | JsonSchemaNode
  | JsonSchemaFormatNode
  | ResponseTextConfigNode
  | TemplateReplaceNode
  | StringFormNode
  | JoinNode
  | NumberToStringNode
  | ObjectToStringNode
  | ObjectToYAMLStringNode
  | CodeFenceNode
  | CreateSelectNode
  | ShowImageNode
  | SelectImageNode
  | ListDownloadedModelsNode
  | ModelInfoToModelListNode
  | LMStudioStartNode
  | LMStudioStopNode
  | LMStudioLoadModelNode
  | LMStudioToUChatCommandNode
  | ServerStatusNode
  | UnLoadModelNode
  | LLMPredictionConfigNode
  | ComfyUINode
  | LoadWorkflowNode
  | WorkflowInputsNode
  | OpenAIToChatEventNode
  | OpenAIToUChatCommandNode
  | UChatToOpenAINode
  | UChatToLMStudioNode
  | UChatNode
  | UChatRoleNode
  | LMStudioChatNode
  | ReverseRoleNode;

export type NodeTypeKey = NodeTypes["label"];

// BaseNodeを埋めたもの
export interface NodeInterface
  extends BaseNode<
    NodeTypeKey,
    { [key in string]?: TypedSocket },
    { [key in string]?: TypedSocket },
    { [key in string]?: NodeControl }
  > {}

export const ExecList = [
  "exec",
  "exec2",
  "exec3",
  "exec4",
  "start",
  "stop",
  "reset",
  "continue",
] as const;

export type ExecKey = (typeof ExecList)[number];

// ExecList に対する型ガード
export const isExecKey = (name: string): name is ExecKey =>
  (ExecList as readonly string[]).includes(name);
