import { ClassicPreset } from "rete";
import type OpenAI from "openai";
import type { AreaPlugin } from "rete-area-plugin";
import type { HistoryPlugin } from "rete-history-plugin";
import type { DataflowEngine } from "rete-engine";
import { InputValueControl } from "../../Controls/InputValue";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";
import { CheckBoxControl } from "../../Controls/CheckBox";
import { getInputValue } from "../../util/getInput";
import {
  type AreaExtra,
  type TypedSocket,
  type Schemes,
  SerializableInputsNode,
} from "renderer/nodeEditor/types";
import type { OpenAIInput } from "../../Controls/ChatContext/ChatContext";
import { type } from "arktype";
import { SelectControl } from "../../Controls/Select";
const { Output, Input } = ClassicPreset;

// Run ノード
export class OpenAIParamNode extends SerializableInputsNode<
  {
    openaiInput: TypedSocket;
    model: TypedSocket;
    stream: TypedSocket;
    store: TypedSocket;
    temperature: TypedSocket;
    serviceTier: TypedSocket;
  },
  { param: TypedSocket },
  object
> {
  value = "";
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
        key: "openaiInput",
        schemaSpec: ["string", "chatContext"],
        label: "input",
      },
      {
        key: "model",
        schemaSpec: "string",
        label: 'model (Default "gpt-4.1")',
        control: new InputValueControl<string>("gpt-4.1", {
          type: "string",
          label: 'model (Default "gpt-4.1")',
          ...opts,
        }),
      },
      {
        key: "stream",
        schemaSpec: "boolean",
        label: "stream",
        control: new CheckBoxControl(true, {
          label: "stream",
          ...opts,
        }),
      },
      {
        key: "store",
        schemaSpec: "boolean",
        label: "store",
        control: new CheckBoxControl(false, {
          label: "store",
          ...opts,
        }),
      },
      {
        key: "serviceTier",
        schemaSpec: type("'auto' | 'default' | 'flex'"),
        label: "service_tier",
        control: new SelectControl<"auto" | "default" | "flex">(
          "auto",
          [
            { label: "auto", value: "auto" },
            { label: "default", value: "default" },
            { label: "flex", value: "flex" },
          ],
          {
            label: "service_tier",
            ...opts,
          }
        ),
      },
    ]);

    this.addOutputPort({
      key: "param",
      schemaSpec: "OpenAIParam",
    });
  }

  data(inputs: {
    openaiInput?: OpenAIInput[];
    model?: string[];
    stream?: boolean[];
    store?: boolean[];
    temperature?: number[];
  }): { param: OpenAI.Responses.ResponseCreateParams } {
    const stream = getInputValue(this.inputs, "stream", inputs);
    const store = getInputValue(this.inputs, "store", inputs);
    const param: OpenAI.Responses.ResponseCreateParams = {
      model: getInputValue(this.inputs, "model", inputs) ?? "gpt-4.1",
      input: inputs.openaiInput?.[0] || "",
      ...(stream !== undefined && { stream }),
      ...(store !== undefined && { store }),
    };
    return { param };
  }
  async execute(): Promise<void> {}
}
