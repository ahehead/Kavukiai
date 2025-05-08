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

export type AreaExtra = ReactArea2D<Schemes> | ContextMenuExtra;

export type Schemes = GetSchemes<NodeTypes, Connection<Node, Node>>;

export type NodeTypes =
  | StringNode
  | RunNode
  | MultiLineStringNode
  | ViewStringNode;

class Connection<
  A extends Node,
  B extends Node
> extends ClassicPreset.Connection<A, B> {
  isLoop?: boolean;
  isExec?: boolean;
}

export class CustomSocketType extends ClassicPreset.Socket {
  type?: string;
}

// 型参照用のインターフェイス
export interface Node
  extends ClassicPreset.Node<
    { [key in string]: CustomSocketType },
    { [key in string]: CustomSocketType },
    {
      [key in string]:
        | RunButtonControl
        | MultiLineControl
        | ClassicPreset.Control
        | ClassicPreset.InputControl<"number">
        | ClassicPreset.InputControl<"text">;
    }
  > {}
