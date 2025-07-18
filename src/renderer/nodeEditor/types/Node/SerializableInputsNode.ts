import type { InputPortJson } from "shared/JsonType";
import type { NodeControl } from "..";
import type { SerializableControl } from "../BaseControl";
import type { TypedSocket } from "../TypedSocket";
import { BaseNode } from "./BaseNode";

// inputsをシリアライズできるように拡張したノードクラス

export class SerializableInputsNode<
  L extends string,
  Inputs extends {
    [key in string]?: TypedSocket;
  },
  Outputs extends {
    [key in string]?: TypedSocket;
  },
  Controls extends {
    [key in string]?: NodeControl;
  }
> extends BaseNode<L, Inputs, Outputs, Controls> {
  serializeInputs(): { inputs: Record<string, InputPortJson> } {
    const inputsJson: Record<string, InputPortJson> = {};
    for (const [key, input] of Object.entries(this.inputs)) {
      if (!input) continue;
      const controlJson = input.control?.toJSON();
      inputsJson[key] = {
        isShowControl: input.showControl,
        ...(controlJson !== undefined ? { control: controlJson } : {}),
      };
    }
    return { inputs: inputsJson };
  }

  deserializeInputs(inputsJson: Record<string, InputPortJson>): void {
    for (const [key, inputJson] of Object.entries(inputsJson)) {
      const input = this.inputs[key as keyof Inputs];
      if (!input) continue;
      input.showControl = inputJson.isShowControl;
      if (inputJson.control && input.control) {
        (input.control as unknown as SerializableControl).setFromJSON(
          inputJson.control
        );
      }
    }
  }
}
