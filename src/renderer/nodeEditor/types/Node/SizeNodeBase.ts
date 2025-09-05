import type { AreaPlugin } from "rete-area-plugin";
import type { NodeControl } from "../NodeControl";
import type { AreaExtra, Schemes } from "../Schemes";
import type { TypedSocket } from "../Socket/TypedSocket";
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

  private _width?: number;
  private _height?: number;

  protected constructor(label: L) {
    super(label);
  }

  setRowSize(width: number | undefined, height: number | undefined) {
    this._width = width;
    this._height = height;
  }

  getRowSize(): { width: number | undefined; height: number | undefined } {
    return { width: this._width, height: this._height };
  }

  clearSize() {
    this._width = undefined;
    this._height = undefined;
  }

  clearHeight() {
    this._height = undefined;
  }

  get width() {
    return this._width;
  }

  set width(value: number | undefined) {
    this._width = value;
  }

  get height() {
    return this._height;
  }

  set height(value: number | undefined) {
    this._height = value;
  }

  getElementSize(area: AreaPlugin<Schemes, AreaExtra>) {
    if (this._width !== undefined && this._height !== undefined) {
      return { width: this._width, height: this._height };
    }
    const nodeView = area.nodeViews.get(this.id);
    const zoom = area.area.transform.k;
    if (!nodeView) return null;
    const { width, height } = nodeView.element.getBoundingClientRect();
    return { width: width / zoom, height: height / zoom };
  }
}
