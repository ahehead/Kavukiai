import type { NodeControl } from "../../types/NodeControl";
import type { SerializableControl } from "../../types/BaseControl";
import type { InputPortJson } from "shared/JsonType";
import type { TypedSocket } from "../../types";
import { BaseNode } from "./BaseNode";

export class SerializableInputsNode<
  Inputs extends { [key in string]?: TypedSocket },
  Outputs extends { [key in string]?: TypedSocket },
  Controls extends { [key in string]?: NodeControl }
> extends BaseNode<Inputs, Outputs, Controls> {
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
