import type { GetSchemes } from "rete";
import type { ReactArea2D } from "rete-react-plugin";
import type { ContextMenuExtra } from "rete-context-menu-plugin";

import type {
  ResponseInputMessageItemListNode,
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
  IFNode,
  ListNode,
  ObjectPickNode,
  ObjectInputNode,
  TSchemaNode,
  JsonSchemaFormatNode,
  ResponseTextConfigNode,
} from "../nodes/Node";
import type { Connection } from "./Connection";
import type { BaseNode } from "./Node/BaseNode";
import type { TypedSocket } from "./TypedSocket";
import type { NodeControl } from "./NodeControl";

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
  | BoolNode
  | IFNode
  | ListNode
  | ObjectPickNode
  | ObjectInputNode
  | TSchemaNode
  | JsonSchemaFormatNode
  | ResponseTextConfigNode;

// BaseNodeを埋めたもの
export interface NodeInterface
  extends BaseNode<
    { [key in string]?: TypedSocket },
    { [key in string]?: TypedSocket },
    { [key in string]?: NodeControl }
  > {}

export const ExecList = ["exec", "exec2"];
