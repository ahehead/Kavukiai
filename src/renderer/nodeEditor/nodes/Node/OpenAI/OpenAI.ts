import { ClassicPreset } from "rete";
import { ConsoleControl } from "../../Controls/Console";
import { electronApiService } from "renderer/features/services/appService";
import type OpenAI from "openai";
import type { OpenAIRequestArgs, PortEventType } from "shared/ApiType";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine, DataflowEngine } from "rete-engine";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";
import {
  type AreaExtra,
  createSocket,
  type NodeSocket,
  type Schemes,
  SerializableInputsNode,
} from "renderer/nodeEditor/types";
import { ButtonControl } from "../../Controls/Button";
const { Output, Input } = ClassicPreset;

// Run ノード
export class OpenAINode extends SerializableInputsNode<
  { exec: NodeSocket; param: NodeSocket },
  { exec: NodeSocket; message: NodeSocket },
  { console: ConsoleControl }
> {
  value = "";
  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super("OpenAI");
    this.addInput("exec", new Input(createSocket("exec"), undefined, true));
    this.inputs.exec?.addControl(
      new ButtonControl("Run", async (e) => {
        e.stopPropagation();
        this.controlflow.execute(this.id);
      })
    );
    if (this.inputs.exec) {
      this.inputs.exec.showControl = false;
    }

    this.addInput(
      "param",
      new Input(createSocket("OpenAIParam"), undefined, true)
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
      param?: OpenAI.Responses.ResponseCreateParams[];
    };
    this.controls.console.addValue(`param: ${JSON.stringify(param, null, 2)}`);
    if (!param) {
      this.controls.console.addValue("Error: No param");
      console.error("Error: No param");
      return;
    }
    this.controls.console.addValue("start");
    const port = await createOpenAIMessagePort({
      id: this.id,
      param: param[0],
    });

    port.onmessage = (e: MessageEvent) => {
      const result = e.data as PortEventType;
      //console.log("result", result);
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
        console.log("done", result);
        this.controls.console.addValue("done");
        port.close();
      }
      forward("exec");
    };
  }
}

async function createOpenAIMessagePort({
  id,
  param,
}: OpenAIRequestArgs): Promise<MessagePort> {
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
    electronApiService.sendChatGptMessage({ id, param });
  });
}
