import type { NodeControl } from "../NodeControl";
import type { TypedSocket } from "../TypedSocket";
import { NodeIO } from "./NodeIO";

export const NodeMinWidth = 220;
export const NodeMinHeight = 100;

// サイズ関連の機能のみを提供するベースクラス
export abstract class SizeNodeBase<
  L extends string,
  Inputs extends { [key in string]?: TypedSocket },
  Outputs extends { [key in string]?: TypedSocket },
  Controls extends { [key in string]?: NodeControl }
> extends NodeIO<Inputs, Outputs, Controls> {
  declare readonly label: L;

  private _width: number;
  private _height: number;

  protected constructor(label: L) {
    super(label);
    this._width = NodeMinWidth;
    this._height = NodeMinHeight;
  }

  setSize(width: number, height: number) {
    this._width = width;
    this._height = height;
  }

  getSize(): { width: number | undefined; height: number | undefined } {
    return { width: this._width, height: this._height };
  }

  clearSize() {
    this._width = NodeMinWidth;
    this._height = NodeMinHeight;
  }

  clearHeight() {
    this._height = NodeMinHeight;
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }
}
