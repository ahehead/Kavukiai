import type { GetSchemes } from "rete";
import type { ReactArea2D } from "rete-react-plugin";
import type { ContextMenuExtra } from "rete-context-menu-plugin";

import type {
  ChatContextNode,
  MultiLineStringNode,
  OpenAINode,
  OpenAIResponseParamNode,
  RunNode,
  StringNode,
  ViewStringNode,
} from "../nodes/Node";
import type { Connection } from "./Connection";
import type { BaseNode } from "./BaseNode";
import type { NodeSocket } from "./NodeSocket";
import type { NodeControl } from "./NodeControl";

export type AreaExtra = ReactArea2D<Schemes> | ContextMenuExtra;

export type Schemes = GetSchemes<
  NodeTypes,
  Connection<NodeInterface, NodeInterface>
>;

export type NodeTypes =
  | StringNode
  | RunNode
  | MultiLineStringNode
  | ViewStringNode
  | OpenAINode
  | OpenAIResponseParamNode
  | ChatContextNode;

// BaseNodeを埋めたもの
export interface NodeInterface
  extends BaseNode<
    { [key in string]?: NodeSocket },
    { [key in string]?: NodeSocket },
    {
      [key in string]?: NodeControl;
    }
  > {}
