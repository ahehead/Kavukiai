import { ClassicPreset } from "rete";
import {
  type AreaExtra,
  BaseNode,
  type CustomSocketType,
  type Schemes,
} from "../../../types";
import { createSocket } from "../../Sockets";
import type OpenAI from "openai";
import type { AreaPlugin } from "rete-area-plugin";
import type { HistoryPlugin } from "rete-history-plugin";
import type { DataflowEngine } from "rete-engine";
import { InputValueControl } from "../../Controls/InputValue";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";
import { CheckBoxControl } from "../../Controls/CheckBox";
const { Output, Input } = ClassicPreset;

// Run ノード
export class OpenAIResponseParamNode extends BaseNode<
  {
    model: CustomSocketType;
    stream: CustomSocketType;
    store: CustomSocketType;
    temperature: CustomSocketType;
  },
  { param: CustomSocketType },
  object
> {
  value = "";
  constructor(
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super("OpenAIResponseParam");
    this.addOutput(
      "param",
      new Output(createSocket("OpenAIResponseParam"), undefined, true)
    );
    this.addInput("model", new Input(createSocket("string"), "model", false));
    this.inputs.model?.addControl(
      new InputValueControl<string>("gpt-4.1", {
        type: "string",
        label: "model",
        editable: true,
        history: history,
        area: area,
        onChange: (v: string) => {
          resetCacheDataflow(dataflow, this.id);
        },
      })
    );
    this.addInput(
      "stream",
      new Input(createSocket("boolean"), "stream", false)
    );
    this.inputs.stream?.addControl(
      new CheckBoxControl(true, {
        label: "stream",
        editable: true,
        history: history,
        area: area,
        onChange: (v: boolean) => {
          resetCacheDataflow(dataflow, this.id);
        },
      })
    );
    this.addInput("store", new Input(createSocket("boolean"), "store", false));
    this.inputs.store?.addControl(
      new CheckBoxControl(false, {
        label: "store",
        editable: false,
        history: history,
        area: area,
        onChange: (v: boolean) => {
          resetCacheDataflow(dataflow, this.id);
        },
      })
    );
    this.addInput(
      "temperature",
      new Input(createSocket("number"), "temperature", false)
    );
    this.inputs.temperature?.addControl(
      new InputValueControl<number>(0.7, {
        type: "number",
        label: "temperature",
        step: 0.1,
        editable: true,
        history: history,
        area: area,
        onChange: (v: number) => {
          resetCacheDataflow(dataflow, this.id);
        },
      })
    );
  }

  data(inputs: {
    model?: string[];
    stream?: boolean[];
    store?: boolean[];
    temperature?: number[];
  }): { param: OpenAI.Responses.ResponseCreateParams } {
    console.log("inputs", inputs);
    const stream = getInputValue(this.inputs, "stream", inputs);
    const store = getInputValue(this.inputs, "store", inputs);
    const temperature = getInputValue(this.inputs, "temperature", inputs);
    const param: OpenAI.Responses.ResponseCreateParams = {
      model: getInputValue(this.inputs, "model", inputs) ?? "gpt-4.1",
      input: [
        {
          role: "user",
          content: "こんにちは.",
        },
      ],
      ...(stream !== undefined && { stream }),
      ...(store !== undefined && { store }),
      ...(temperature !== undefined && { temperature }),
    };
    return { param };
  }
  async execute(): Promise<void> {}
}

export function getInputValue(
  inputs: any,
  inputName: string,
  nodeInputsFromDataflow: any
) {
  const reteInput = inputs[inputName];

  if (reteInput?.control && reteInput.showControl) {
    return reteInput.control.getValue();
  }

  const values = nodeInputsFromDataflow[inputName];
  if (Array.isArray(values) && values.length > 0) {
    return values[0];
  }

  return undefined;
}
