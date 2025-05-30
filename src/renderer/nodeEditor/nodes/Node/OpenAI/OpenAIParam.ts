import type OpenAI from "openai";
import type { AreaPlugin } from "rete-area-plugin";
import type { HistoryPlugin } from "rete-history-plugin";
import type { DataflowEngine } from "rete-engine";
import { InputValueControl } from "../../Controls/input/InputValue";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";
import { CheckBoxControl } from "../../Controls/input/CheckBox";
import { getInputValue } from "../../util/getInput";
import {
  type AreaExtra,
  type TypedSocket,
  type Schemes,
  SerializableInputsNode,
} from "renderer/nodeEditor/types";
import { type } from "arktype";
import { SelectControl } from "../../Controls/input/Select";
import type { ResponseCreateParamsBase } from "openai/resources/responses/responses.mjs";

type OpenAIParamKeys = keyof ResponseCreateParamsBase;

// Run ノード
export class OpenAIParamNode extends SerializableInputsNode<
  Record<OpenAIParamKeys, TypedSocket>,
  { param: TypedSocket },
  object
> {
  constructor(
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super("OpenAIParam");

    const opts = {
      history,
      area,
      editable: true,
      onChange: () => resetCacheDataflow(dataflow, this.id),
    };

    this.addInputPort([
      {
        key: "input",
        schemaSpec: ["string", "chatContext"],
        label: "input (required)",
        showControl: true,
        control: new InputValueControl<string>({
          value: "hello!",
          type: "string",
          label: "input (required)",
          ...opts,
        }),
      },
      {
        key: "model",
        schemaSpec: "string",
        label: "model (required)",
        showControl: true,
        control: new InputValueControl<string>({
          value: "gpt-4.1",
          type: "string",
          label: "model (required)",
          ...opts,
        }),
      },
      {
        key: "stream",
        schemaSpec: "boolean",
        label: "stream",
        control: new CheckBoxControl({
          value: true,
          label: "stream",
          ...opts,
        }),
      },
      {
        key: "store",
        schemaSpec: "boolean",
        label: "store",
        control: new CheckBoxControl({
          value: false,
          label: "store",
          ...opts,
        }),
      },
      {
        key: "instructions",
        schemaSpec: "string",
        label: "instructions",
        control: new InputValueControl<string>({
          value: "",
          type: "string",
          label: "instructions",
          ...opts,
        }),
      },
      {
        key: "service_tier",
        schemaSpec: type("'auto' | 'default' | 'flex'"),
        label: "service_tier",
        control: new SelectControl<"auto" | "default" | "flex">({
          value: "auto",
          optionsList: [
            { label: "auto", value: "auto" },
            { label: "default", value: "default" },
            { label: "flex", value: "flex" },
          ],
          label: "service_tier",
          ...opts,
        }),
      },
    ]);

    this.addOutputPort({
      key: "param",
      schemaSpec: "OpenAIParam",
    });
  }

  data(inputs: Partial<Record<OpenAIParamKeys, unknown[]>>): {
    param: OpenAI.Responses.ResponseCreateParams;
  } {
    const param: Partial<OpenAI.Responses.ResponseCreateParams> = {};

    for (const key of Object.keys(this.inputs) as OpenAIParamKeys[]) {
      const value = getInputValue(this.inputs, key, inputs);
      if (value !== undefined) {
        (param as any)[key] = value;
      }
    }

    return { param: param as OpenAI.Responses.ResponseCreateParams };
  }
  async execute(): Promise<void> {}
}
