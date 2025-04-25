import type { GetSchemes } from "rete";
import { ClassicPreset } from "rete";
import type { ReactArea2D } from "rete-react-plugin";
import type { ContextMenuExtra } from "rete-context-menu-plugin";

import type { MultiLineStringNode } from "./nodes/MultiLineString";
import type { Run, RunButtonControl } from "./nodes/Run";
import type { StringNode } from "./nodes/String";
import type { ViewStringNode } from "./nodes/ViewString";
import type { MultiLineControl } from "./nodes/components/TextArea";

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

export type NodeTypes = StringNode | Run | MultiLineStringNode | ViewStringNode;

export type Schemes = GetSchemes<NodeTypes, Connection<Node, Node>>;

export type AreaExtra = ReactArea2D<Schemes> | ContextMenuExtra;
