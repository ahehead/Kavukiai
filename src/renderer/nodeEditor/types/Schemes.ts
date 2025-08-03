import type { GetSchemes } from "rete";
import type { ContextMenuExtra } from "rete-context-menu-plugin";
import type { ReactArea2D } from "rete-react-plugin";

import type {
  BoolNode,
  ChatMessageListNode,
  ChatMessageListToOpenAIInput,
  ChatMessageListToStringNode,
  ChatMessageNode,
  CodeFenceNode,
  CounterLoopNode,
  CreateSelectNode,
  GetLastMessageNode,
  IFNode,
  ImageNode,
  InspectorNode,
  JoinNode,
  JsonSchemaFormatNode,
  JsonSchemaNode,
  JsonSchemaToObjectNode,
  ListDownloadedModelsNode,
  ListNode,
  LLMPredictionConfigNode,
  LMStudioChatNode,
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
  OpenAIToChatEventNode,
  OpenAIToUChatCommandNode,
  ResponseCreateParamsBaseNode,
  ResponseTextConfigNode,
  ReverseUserAssistantRoleNode,
  RoleNode,
  RunNode,
  ServerStatusNode,
  StringFormNode,
  StringNode,
  TemplateReplaceNode,
  TestNode,
  UChatMessageNode,
  UChatNode,
  UChatRoleNode,
  UChatToOpenAINode,
  UnknownNode,
  UnLoadModelNode,
  UPartTextNode,
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
  | ChatMessageListToOpenAIInput
  | ChatMessageListToStringNode
  | GetLastMessageNode
  | ReverseUserAssistantRoleNode
  | ChatMessageNode
  | RoleNode
  | UChatMessageNode
  | UPartTextNode
  | BoolNode
  | IFNode
  | CounterLoopNode
  | ListNode
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
  | ImageNode
  | LoadImageNode
  | ListDownloadedModelsNode
  | ModelInfoToModelListNode
  | LMStudioStartNode
  | LMStudioStopNode
  | LMStudioLoadModelNode
  | ServerStatusNode
  | UnLoadModelNode
  | LLMPredictionConfigNode
  | OpenAIToChatEventNode
  | OpenAIToUChatCommandNode
  | UChatToOpenAINode
  | UChatNode
  | UChatRoleNode
  | LMStudioChatNode;

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
];
