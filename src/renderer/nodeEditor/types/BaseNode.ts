import { ClassicPreset } from "rete";
import type { NodeSocket } from "./NodeSocket";
import type { NodeControl } from "./NodeControl";

// ClassicPreset.Nodeを拡張
export class BaseNode<
  Inputs extends {
    [key in string]?: NodeSocket;
  },
  Outputs extends {
    [key in string]?: NodeSocket;
  },
  Controls extends {
    [key in string]?: NodeControl;
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
  clearSize() {
    this.width = undefined;
    this.height = undefined;
  }
  clearHeight() {
    this.height = undefined;
  }
}
