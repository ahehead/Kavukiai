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

export type Schemes = GetSchemes<
  NodeTypes,
  Connection<NodeInterface, NodeInterface>
>;

export type NodeTypes =
  | StringNode
  | RunNode
  | MultiLineStringNode
  | ViewStringNode;

export type ExtraSizeData = { width?: number; height?: number };

class Connection<
  A extends NodeInterface,
  B extends NodeInterface
> extends ClassicPreset.Connection<A, B> {
  isLoop?: boolean;
  isExec?: boolean;
}

export class CustomSocketType extends ClassicPreset.Socket {
  isConnected = false;

  constructor(name: string, isConnect = false) {
    super(name);
    this.isConnected = isConnect;
  }

  isCompatibleWith(socket: CustomSocketType): boolean {
    return this.name === socket.name;
  }

  setConnected(isConnect: boolean) {
    this.isConnected = isConnect;
  }
}

export class BaseNode<
  Inputs extends { [key in string]?: CustomSocketType },
  Outputs extends { [key in string]?: CustomSocketType },
  Controls extends {
    [key in string]?:
      | RunButtonControl
      | MultiLineControl
      | ClassicPreset.Control
      | ClassicPreset.InputControl<"number">
      | ClassicPreset.InputControl<"text">;
  }
> extends ClassicPreset.Node<Inputs, Outputs, Controls> {
  public width?: number;
  public height?: number;
  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}

// 型参照用のインターフェイス
export interface NodeInterface
  extends BaseNode<
    { [key in string]?: CustomSocketType },
    { [key in string]?: CustomSocketType },
    {
      [key in string]?:
        | RunButtonControl
        | MultiLineControl
        | ClassicPreset.Control
        | ClassicPreset.InputControl<"number">
        | ClassicPreset.InputControl<"text">;
    }
  > {}
