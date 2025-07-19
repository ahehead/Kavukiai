import type { GetSchemes } from "rete";
import type { ContextMenuExtra } from "rete-context-menu-plugin";
import type { ReactArea2D } from "rete-react-plugin";

import type {
  BoolNode,
  CreateSelectNode,
  IFNode,
  ImageNode,
  InspectorNode,
  JsonSchemaFormatNode,
  JsonSchemaNode,
  JsonSchemaToObjectNode,
  ListDownloadedModelsNode,
  ListNode,
  LMStudioStartNode,
  LMStudioStopNode,
  LMStudioLoadModelNode,
  UnLoadModelNode,
  LoadImageNode,
  ModelInfoToModelListNode,
  MultiLineStringNode,
  NumberNode,
  ObjectPickNode,
  OpenAINode,
  ResponseCreateParamsBaseNode,
  ResponseInputMessageItemListNode,
  ResponseInputMessageItemNode,
  ResponseTextConfigNode,
  RunNode,
  StringNode,
  TemplateReplaceNode,
  TestNode,
  UnknownNode,
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
  | ResponseInputMessageItemListNode
  | ResponseInputMessageItemNode
  | BoolNode
  | IFNode
  | ListNode
  | ObjectPickNode
  | JsonSchemaToObjectNode
  | JsonSchemaNode
  | JsonSchemaFormatNode
  | ResponseTextConfigNode
  | TemplateReplaceNode
  | CreateSelectNode
  | ImageNode
  | LoadImageNode
  | ListDownloadedModelsNode
  | ModelInfoToModelListNode
  | LMStudioStartNode
  | LMStudioStopNode
  | LMStudioLoadModelNode
  | UnLoadModelNode;

export type NodeTypeKey = NodeTypes["label"];

// BaseNodeを埋めたもの
export interface NodeInterface
  extends BaseNode<
    NodeTypeKey,
    { [key in string]?: TypedSocket },
    { [key in string]?: TypedSocket },
    { [key in string]?: NodeControl }
  > {}

export const ExecList = ["exec", "exec2"];
