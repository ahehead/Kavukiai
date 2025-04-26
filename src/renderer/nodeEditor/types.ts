import type { GetSchemes } from "rete";
import { ClassicPreset } from "rete";
import type { ReactArea2D } from "rete-react-plugin";
import type { ContextMenuExtra } from "rete-context-menu-plugin";

import type { RunButtonControl } from "./nodes/Controls/RunButton";
import type { MultiLineControl } from "./nodes/Controls/TextArea";
import type {
  MultiLineStringNode,
  RunNode,
  StringNode,
  ViewStringNode,
} from "./nodes/Node";

export class Node extends ClassicPreset.Node<
  { [key in string]: ClassicPreset.Socket },
  { [key in string]: ClassicPreset.Socket },
  {
    [key in string]:
      | RunButtonControl
      | MultiLineControl
      | ClassicPreset.Control
      | ClassicPreset.InputControl<"number">
      | ClassicPreset.InputControl<"text">;
  }
> {}

class Connection<
  A extends Node,
  B extends Node
> extends ClassicPreset.Connection<A, B> {
  isLoop?: boolean;
}

export type NodeTypes =
  | StringNode
  | RunNode
  | MultiLineStringNode
  | ViewStringNode;

export type Schemes = GetSchemes<NodeTypes, Connection<Node, Node>>;

export type AreaExtra = ReactArea2D<Schemes> | ContextMenuExtra;
