import type { NodeControl } from "../NodeControl";
import type { TypedSocket } from "../TypedSocket";
import { NodeIO } from "./NodeIO";

// サイズ関連の機能のみを提供するベースクラス
export abstract class SizeNodeBase<
  L extends string,
  Inputs extends { [key in string]?: TypedSocket },
  Outputs extends { [key in string]?: TypedSocket },
  Controls extends { [key in string]?: NodeControl }
> extends NodeIO<Inputs, Outputs, Controls> {
  declare readonly label: L;

  public width?: number;
  public height?: number;

  protected constructor(label: L) {
    super(label);
  }

  setSize(width?: number, height?: number) {
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
