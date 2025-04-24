import type { GetSchemes } from "rete";
import { ClassicPreset } from "rete";
import type { ReactArea2D } from "rete-react-plugin";
import type { ContextMenuExtra } from "rete-context-menu-plugin";
import type { Run, RunButtonControl, StringNode } from "./nodes/BasicNodes";

export class Node extends ClassicPreset.Node<
  { [key in string]: ClassicPreset.Socket },
  { [key in string]: ClassicPreset.Socket },
  {
    [key in string]:
      | RunButtonControl
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

export type NodeTypes = StringNode | Run;

export type Schemes = GetSchemes<NodeTypes, Connection<Node, Node>>;

export type AreaExtra = ReactArea2D<Schemes> | ContextMenuExtra;
