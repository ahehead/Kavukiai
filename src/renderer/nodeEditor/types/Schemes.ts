import type { GetSchemes } from "rete";
import type { ContextMenuExtra } from "rete-context-menu-plugin";
import type { ReactArea2D } from "rete-react-plugin";

import type {
  BoolNode,
  ChatMessageListNode,
  ChatMessageListToOpenAIInput,
  ChatMessageNode,
  CounterLoopNode,
  CreateSelectNode,
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
  LMStudioLoadModelNode,
  LMStudioStartNode,
  LMStudioStopNode,
  LoadImageNode,
  ModelInfoToModelListNode,
  MultiLineStringNode,
  NumberNode,
  ObjectPickNode,
  OpenAINode,
  ResponseCreateParamsBaseNode,
  ResponseTextConfigNode,
  RoleNode,
  RunNode,
  StringFormNode,
  StringNode,
  TemplateReplaceNode,
  TestNode,
  UnknownNode,
  UnLoadModelNode,
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
  | ChatMessageNode
  | RoleNode
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
  | CreateSelectNode
  | ImageNode
  | LoadImageNode
  | ListDownloadedModelsNode
  | ModelInfoToModelListNode
  | LMStudioStartNode
  | LMStudioStopNode
  | LMStudioLoadModelNode
  | UnLoadModelNode
  | LLMPredictionConfigNode;

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
