import { ClassicPreset } from "rete";
import type { NodeSocket } from "./NodeSocket";
import type { NodeControl, SerializableControl } from "./NodeControl";
import type { InputPortJson } from "shared/JsonType";

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

// inputsをシリアライズできるように拡張したノードクラス
export class SerializableInputsNode<
  Inputs extends { [key in string]?: NodeSocket },
  Outputs extends { [key in string]?: NodeSocket },
  Controls extends { [key in string]?: NodeControl }
> extends BaseNode<Inputs, Outputs, Controls> {
  protected hasToJson = (c: unknown): c is SerializableControl =>
    typeof (c as SerializableControl | undefined)?.toJSON === "function";

  protected hasSetFromJson = (c: unknown): c is SerializableControl =>
    typeof (c as any).setFromJSON === "function";

  toInputsJson(): { inputs: Record<string, InputPortJson> } {
    const inputsJson: Record<string, InputPortJson> = {};
    for (const [key, input] of Object.entries(this.inputs)) {
      if (input) {
        inputsJson[key] = {
          isShowControl: input.showControl,
          ...(this.hasToJson(input.control) && {
            control: input.control.toJSON(),
          }),
        };
      }
    }
    return { inputs: inputsJson };
  }

  setFromInputsJson(inputsJson: Record<string, InputPortJson>): void {
    for (const [key, inputJson] of Object.entries(inputsJson)) {
      const input = this.inputs[key as keyof Inputs];
      if (input) {
        input.showControl = inputJson.isShowControl;
        if (
          inputJson.control &&
          input.control &&
          this.hasSetFromJson(input.control)
        ) {
          input.control.setFromJSON(inputJson.control);
        }
      }
    }
  }
}
