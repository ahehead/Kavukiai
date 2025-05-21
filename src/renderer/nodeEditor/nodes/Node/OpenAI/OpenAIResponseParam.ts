import { ClassicPreset } from "rete";
import { BaseNode } from "renderer/nodeEditor/types/BaseNode";
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
  createSocket,
  type NodeSocket,
  type Schemes,
} from "renderer/nodeEditor/types";
const { Output, Input } = ClassicPreset;

// Run ノード
export class OpenAIResponseParamNode extends BaseNode<
  {
    model: NodeSocket;
    stream: NodeSocket;
    store: NodeSocket;
    temperature: NodeSocket;
  },
  { param: NodeSocket },
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
    this.addInput(
      "model",
      new Input(createSocket("string"), 'model (Default "gpt-4.1")', false)
    );
    this.inputs.model?.addControl(
      new InputValueControl<string>("gpt-4.1", {
        type: "string",
        label: 'model (Default "gpt-4.1")',
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
    };
    return { param };
  }
  async execute(): Promise<void> {}
}
