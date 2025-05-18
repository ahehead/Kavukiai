import type { GetSchemes } from "rete";
import { ClassicPreset } from "rete";
import type { ReactArea2D } from "rete-react-plugin";
import type { ContextMenuExtra } from "rete-context-menu-plugin";

import type { RunButtonControl } from "./nodes/Controls/RunButton";
import type { MultiLineControl } from "./nodes/Controls/TextArea";
import type {
  ChatContextNode,
  MultiLineStringNode,
  OpenAINode,
  OpenAIResponseParamNode,
  RunNode,
  StringNode,
  ViewStringNode,
} from "./nodes/Node";
import type { ConsoleControl } from "./nodes/Controls/Console";
import type { InputValueControl } from "./nodes/Controls/InputValue";
import type { CheckBoxControl } from "./nodes/Controls/CheckBox";
import type { ChatContextControl } from "./nodes/Controls/ChatContext/ChatContext";

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

export type ExtraSizeData = { width?: number; height?: number };

export class Connection<
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
      | ClassicPreset.Control
      | RunButtonControl
      | MultiLineControl
      | ConsoleControl
      | InputValueControl<string>
      | InputValueControl<number>
      | ChatContextControl
      | CheckBoxControl;
  }
> extends ClassicPreset.Node<Inputs, Outputs, Controls> {
  public width?: number;
  public height?: number;
  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
  getSize(): { width: number | undefined; height: number | undefined } {
    return { width: this.width, height: this.height };
  }
  getMinHeight(): number {
    const titleHeight = 30;
    const socketHeight = 22;
    const controlHeight = 55;
    const socketCount =
      Object.keys(this.inputs).length + Object.keys(this.outputs).length;
    const controlCount = Object.keys(this.controls).length;
    return (
      titleHeight + socketHeight * socketCount + controlHeight * controlCount
    );
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
        | ConsoleControl
        | InputValueControl<string>
        | InputValueControl<number>
        | ChatContextControl
        | CheckBoxControl;
    }
  > {}
