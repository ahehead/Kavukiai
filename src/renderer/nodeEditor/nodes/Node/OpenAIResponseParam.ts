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
import { MultiLineControl } from "../Controls/TextArea";
import type { HistoryPlugin } from "rete-history-plugin";
import type { DataflowEngine } from "rete-engine";
const { Output } = ClassicPreset;

// Run ノード
export class OpenAIResponseParamNode extends BaseNode<
  object,
  { param: CustomSocketType },
  { model: MultiLineControl }
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
      new MultiLineControl("", true, this.id, history, area, dataflow)
    );
  }

  data(): { param: OpenAI.Responses.ResponseCreateParamsStreaming } {
    const param: OpenAI.Responses.ResponseCreateParamsStreaming = {
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: "Say hello.",
        },
      ],
      stream: true,
      store: false,
    };
    return { param };
  }
  async execute(): Promise<void> {}
}
