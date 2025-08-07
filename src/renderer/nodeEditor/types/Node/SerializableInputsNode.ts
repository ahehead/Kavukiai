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
  /**
   * 入力ポートのシリアライズ
   * @returns シリアライズされた入力ポートのJSON
   */
  serializeInputs(): { inputs: Record<string, InputPortJson> } {
    const inputsJson: Record<string, InputPortJson> = {};
    for (const [key, input] of Object.entries(this.inputs)) {
      if (!input || !input.control) continue;

      const controlJson = input.control.toJSON();
      inputsJson[key] = {
        isShowControl: input.showControl,
        control: controlJson,
      };
    }
    return { inputs: inputsJson };
  }

  /**
   * 入力ポートのデシリアライズ
   * @param inputsJson シリアライズされた入力ポートのJSON
   */
  deserializeInputs(inputsJson: Record<string, InputPortJson>): void {
    for (const [key, inputJson] of Object.entries(inputsJson)) {
      const input = this.inputs[key as keyof Inputs];
      if (!input || !input.control) continue;

      input.showControl = inputJson.isShowControl;
      if (inputJson.control) {
        (input.control as unknown as SerializableControl).setFromJSON(
          inputJson.control
        );
      }
    }
  }

  /**
   * inputのcontrolの値、dataflowの値の順の優先で入力ポートの値を取得
   * @param dataflowInputs データフローエンジンからの入力値
   * @param key 入力ポートのキー
   * @returns 入力ポートの値 | null
   */
  getInputValue<T>(
    dataflowInputs: Partial<Record<keyof Inputs, unknown[]>>,
    key: keyof Inputs
  ): T | null {
    const input = this.inputs[key as keyof Inputs];
    const dataflowInput = dataflowInputs[key as keyof Inputs]?.[0] as T;
    return input?.getShowValue<T>() ?? dataflowInput ?? null;
  }
}
