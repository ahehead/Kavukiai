import { ClassicPreset } from "rete";
import {
  type AreaExtra,
  BaseNode,
  type CustomSocketType,
  type Schemes,
} from "../../../types";
import { createSocket } from "../../Sockets";
import { ConsoleControl } from "../../Controls/Console";
import { electronApiService } from "renderer/features/services/appService";
import type OpenAI from "openai";
import type { StreamArgs, StreamPortType } from "shared/ApiType";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine } from "rete-engine";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";
const { Output, Input } = ClassicPreset;

// Run ノード
export class OpenAINode extends BaseNode<
  { exec: CustomSocketType; param: CustomSocketType },
  { exec: CustomSocketType; message: CustomSocketType },
  { console: ConsoleControl }
> {
  value = "";
  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>
  ) {
    super("OpenAI");
    this.addInput("exec", new Input(createSocket("exec"), undefined, true));
    this.addInput(
      "param",
      new Input(createSocket("OpenAIResponseParam"), undefined, true)
    );
    this.addOutput("exec", new Output(createSocket("exec"), "stream", true));
    this.addOutput(
      "message",
      new Output(createSocket("string"), undefined, true)
    );
    this.addControl("console", new ConsoleControl(area));
  }

  addString(value: string): void {
    this.value += value;
    resetCacheDataflow(this.dataflow, this.id);
  }
  setString(value: string): void {
    this.value = value;
    resetCacheDataflow(this.dataflow, this.id);
  }

  data(): object {
    return { message: this.value };
  }
  async execute(
    input: "exec",
    forward: (output: "exec") => void
  ): Promise<void> {
    const { param } = (await this.dataflow.fetchInputs(this.id)) as {
      param?: OpenAI.Responses.ResponseCreateParamsStreaming[];
    };
    console.log("param", param);
    if (!param) {
      this.controls.console.addValue("Error: No param");
      console.error("Error: No param");
      return;
    }
    const port = await startChatGptStream({ id: this.id, param: param[0] });

    port.onmessage = (e: MessageEvent) => {
      const result = e.data as StreamPortType;
      console.log("result", result);
      if (result.type === "error") {
        this.controls.console.addValue(`Error: ${result.message}`);
        console.error("Error:", result.message);
        port.close();
      }
      if (result.type === "delta") {
        this.addString(result.value);
      }
      if (result.type === "done") {
        this.setString(result.text);
        port.close();
      }
      forward("exec");
    };
  }
}

async function startChatGptStream({
  id,
  param,
}: StreamArgs): Promise<MessagePort> {
  return new Promise<MessagePort>((resolve) => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "node-port" && e.data.id === id) {
        window.removeEventListener("message", handler);
        const [port] = e.ports;
        port.start();
        resolve(port);
      }
    };
    window.addEventListener("message", handler);
    electronApiService.streamChatGpt({ id, param });
  });
}
