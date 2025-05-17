import { ClassicPreset } from "rete";
import {
  type AreaExtra,
  BaseNode,
  type CustomSocketType,
  type Schemes,
} from "../../types";
import { createSocket } from "../Sockets";
import type OpenAI from "openai";
import type { AreaPlugin } from "rete-area-plugin";
import type { HistoryPlugin } from "rete-history-plugin";
import type { DataflowEngine } from "rete-engine";
import { InputValueControl } from "../Controls/InputValue";
import { resetCacheDataflow } from "../util/resetCacheDataflow";
const { Output } = ClassicPreset;

// Run ノード
export class OpenAIResponseParamNode extends BaseNode<
  object,
  { param: CustomSocketType },
  {
    model: InputValueControl<string>;
    temperature: InputValueControl<number>;
  }
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
    this.addControl(
      "model",
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
    this.addControl(
      "temperature",
      new InputValueControl<number>(0.7, {
        type: "number",
        label: "temperature",
        editable: true,
        history: history,
        area: area,
        onChange: (v: number) => {
          resetCacheDataflow(dataflow, this.id);
        },
      })
    );
  }

  data(): { param: OpenAI.Responses.ResponseCreateParamsStreaming } {
    const param: OpenAI.Responses.ResponseCreateParamsStreaming = {
      model: this.controls.model.getValue(),
      input: [
        {
          role: "user",
          content: "Say hello.",
        },
      ],
      stream: true,
      store: false,
      temperature: this.controls.temperature.getValue(),
    };
    return { param };
  }
  async execute(): Promise<void> {}
}
