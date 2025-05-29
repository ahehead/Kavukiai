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
  type TypedSocket,
  NodeStatus,
  type Schemes,
  SerializableInputsNode,
} from "renderer/nodeEditor/types";
import { ButtonControl } from "../../Controls/Button";
const { Output, Input } = ClassicPreset;

// Run ノード
export class OpenAINode extends SerializableInputsNode<
  { exec: TypedSocket; exec2: TypedSocket; param: TypedSocket },
  { exec: TypedSocket; message: TypedSocket },
  { console: ConsoleControl }
> {
  value = "";
  port: MessagePort | null = null;
  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super("OpenAI");
    this.addInputPort([
      {
        key: "exec",
        schemaSpec: "exec",
        label: "Run",
        control: new ButtonControl("Run", async (e) => {
          e.stopPropagation();
          this.controlflow.execute(this.id, "exec");
        }),
      },
      {
        key: "exec2",
        schemaSpec: "exec",
        label: "Stop",
        control: new ButtonControl("Stop", async (e) => {
          e.stopPropagation();
          this.controlflow.execute(this.id, "exec2");
        }),
      },
      {
        key: "param",
        schemaSpec: "OpenAIParam",
        tooltip: "OpenAI用パラメータ",
      },
    ]);
    this.addOutputPort([
      {
        key: "exec",
        schemaSpec: "exec",
        label: "stream",
      },
      {
        key: "message",
        schemaSpec: "string",
      },
    ]);
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

  resetString(): void {
    this.value = "";
    resetCacheDataflow(this.dataflow, this.id);
  }
  // portのclose処理
  closePort(): void {
    if (this.port) {
      this.port.close();
      this.port = null;
    }
  }

  //errorとdoneのときの終了処理
  logAndTerminate(type: "error" | "done", message: string): void {
    if (type === "error") {
      this.controls.console.addValue(`Error: ${message}`);
      console.error(`Error: ${message}`);
      this.setStatus(this.area, NodeStatus.ERROR);
    } else if (type === "done") {
      this.controls.console.addValue(`Done: ${message}`);
      console.log(`Done: ${message}`);
      this.setStatus(this.area, NodeStatus.COMPLETED);
    }
    this.closePort();
  }

  data(): object {
    return { message: this.value };
  }

  async execute(
    input: "exec" | "exec2",
    forward: (output: "exec") => void
  ): Promise<void> {
    // exec2が実行された場合は、ポートを閉じて終了
    if (input === "exec2") {
      if (this.status === NodeStatus.RUNNING && this.port) {
        const message: PortEventType = { type: "abort" };
        this.port.postMessage(message);
        this.closePort();
        this.setStatus(this.area, NodeStatus.IDLE);
        this.controls.console.addValue("Stop");
      } else {
        this.controls.console.addValue("Already stopped");
      }
      return;
    }

    // running状態で実行された場合は何もしない
    if (this.status === NodeStatus.RUNNING) {
      this.controls.console.addValue("Already running");
      return;
    }

    this.setStatus(this.area, NodeStatus.RUNNING);
    this.resetString();
    const { param } = (await this.dataflow.fetchInputs(this.id)) as {
      param?: OpenAI.Responses.ResponseCreateParams[];
    };
    this.controls.console.addValue(`Param: ${JSON.stringify(param, null, 2)}`);
    if (!param) {
      this.logAndTerminate("error", "No param");
      return;
    }
    this.controls.console.addValue("Start");
    // ポートの作成とstart
    this.port = await createOpenAIMessagePort({
      id: this.id,
      param: param[0],
    });

    this.port.onmessage = (e: MessageEvent) => {
      const result = e.data as PortEventType;
      //console.log("result", result);
      if (result.type === "error") {
        this.logAndTerminate("error", result.message);
      }
      if (result.type === "delta") {
        this.addString(result.value);
      }
      if (result.type === "done") {
        this.setString(result.text);
        this.logAndTerminate("done", result.text);
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
