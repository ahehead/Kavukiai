import { ClassicPreset } from "rete";
import {
  type AreaExtra,
  BaseNode,
  type CustomSocketType,
  type Schemes,
} from "../../types";
import { createSocket } from "../Sockets";
import { ConsoleControl } from "../Controls/Console";
import { electronApiService } from "renderer/features/services/appService";
import type OpenAI from "openai";
import type { StreamArgs, StreamPortType } from "shared/ApiType";
import type { AreaPlugin } from "rete-area-plugin";
const { Output, Input } = ClassicPreset;

// Run ノード
export class OpenAINode extends BaseNode<
  { exec: CustomSocketType },
  { exec: CustomSocketType },
  { console: ConsoleControl }
> {
  constructor(private area: AreaPlugin<Schemes, AreaExtra>) {
    super("OpenAI");
    this.addInput("exec", new Input(createSocket("exec"), undefined, true));
    this.addOutput("exec", new Output(createSocket("exec"), undefined, true));
    this.addControl("console", new ConsoleControl(area));
  }

  data(): object {
    return {};
  }
  async execute(
    input: "exec",
    forward: (output: "exec") => void
  ): Promise<void> {
    console.log("OpenAI Node executed");
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: "Hello, how are you?",
        },
      ],
    };
    const port = await streamStart({ id: this.id, params });
    port.onmessage = (e: MessageEvent) => {
      const result = e.data as StreamPortType;
      if (result.type === "delta") this.controls.console.addValue(result.value);
      if (result.type === "error") {
        this.controls.console.addValue(`Error: ${result.message}`);
        console.error("Error:", result.message);
        port.close();
      }
      if (result.type === "done") port.close();
    };
  }
}

async function streamStart({ id, params }: StreamArgs): Promise<MessagePort> {
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
    electronApiService.streamChatGpt({ id, params });
  });
}
