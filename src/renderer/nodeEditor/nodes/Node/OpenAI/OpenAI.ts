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
} from "renderer/nodeEditor/types";
import { ButtonControl } from "../../Controls/Button";
import { SerializableInputsNode } from "renderer/nodeEditor/types/Node/SerializableInputsNode";
import type { Response } from "renderer/nodeEditor/types/Schemas/ResponseSchemas";
import type { ResponseStreamEvent } from "renderer/nodeEditor/types/Schemas/EventsSchemas";

// Run ノード
export class OpenAINode extends SerializableInputsNode<
  { exec: TypedSocket; exec2: TypedSocket; param: TypedSocket },
  { exec: TypedSocket; message: TypedSocket },
  { console: ConsoleControl }
> {
  port: MessagePort | null = null;
  // OpenAi Clientのレスポンスを保持する
  response: Response | null = null;
  event: ResponseStreamEvent | null = null;
  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super("OpenAI");
    this.addInputPortPattern({
      type: "RunButton",
      controlflow: this.controlflow,
    });
    this.addInputPort([
      {
        key: "exec2",
        typeName: "exec",
        label: "Stop",
        control: new ButtonControl({
          label: "Stop",
          onClick: async (e) => {
            e.stopPropagation();
            this.controlflow.execute(this.id, "exec2");
          },
        }),
      },
      {
        key: "param",
        typeName: "ResponseCreateParamsBase",
        tooltip: "OpenAI用パラメータ",
      },
    ]);
    this.addOutputPort([
      {
        key: "exec",
        typeName: "exec",
        label: "StreamEvent|Response",
      },
      {
        key: "message",
        typeName: "string",
      },
    ]);
    this.addControl("console", new ConsoleControl({ area }));
  }

  setResponse(response: Response): void {
    this.controls.console.addValue("response set");
    this.response = response;
    resetCacheDataflow(this.dataflow, this.id);
  }

  setEvent(event: ResponseStreamEvent): void {
    this.controls.console.addValue("event set");
    this.event = event;
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
  async logAndTerminate(
    type: "error" | "done",
    message: string
  ): Promise<void> {
    if (type === "error") {
      this.controls.console.addValue(`Error: ${message}`);
      console.error(`Error: ${message}`);
      // nodeのステータスをERRORに設定
      await this.setStatus(this.area, NodeStatus.ERROR);
    } else if (type === "done") {
      this.controls.console.addValue(`Done: ${message}`);
      console.log(`Done: ${message}`);
      // nodeのステータスをCOMPLETEDに設定
      await this.setStatus(this.area, NodeStatus.COMPLETED);
    }
    this.closePort();
  }

  data(): { message: string } {
    if (this.event?.type === "response.output_text.done") {
      return { message: this.event?.text || "" };
    }
    if (this.status === NodeStatus.COMPLETED) {
      return { message: this.response?.output_text || "" };
    }
    if (this.event?.type === "response.output_text.delta") {
      return { message: this.event?.delta || "" };
    }

    return { message: this.response?.output_text || "" };
  }

  // 通信Stop処理
  private async stopExecution(): Promise<void> {
    if (this.status === NodeStatus.RUNNING && this.port) {
      const message: PortEventType = { type: "abort" };
      this.port.postMessage(message);
      this.closePort();
      await this.setStatus(this.area, NodeStatus.IDLE);
      this.controls.console.addValue("Stop");
    } else {
      this.controls.console.addValue("Already stopped");
    }
  }

  private async beginExecution(
    forward: (output: "exec") => void
  ): Promise<void> {
    if (this.status === NodeStatus.RUNNING) {
      this.controls.console.addValue("Already running");
      return;
    }
    // ステータスをRUNNINGに設定
    await this.setStatus(this.area, NodeStatus.RUNNING);

    // 入力からopen aiに渡すパラメータを取得
    const { param } = (await this.dataflow.fetchInputs(this.id)) as {
      param?: OpenAI.Responses.ResponseCreateParams[];
    };

    this.controls.console.addValue(`Param: ${JSON.stringify(param, null, 2)}`);
    // パラメータがない場合は終了
    if (!param) {
      await this.logAndTerminate("error", "No param");
      return;
    }
    this.controls.console.addValue("Start");

    // ポートを作成、通信開始
    this.port = await createOpenAIMessagePort({
      id: this.id,
      param: param[0],
    });

    // portに登録
    this.port.onmessage = (e: MessageEvent) =>
      this.handlePortMessage(e, forward);
  }

  private async handlePortMessage(
    e: MessageEvent,
    forward: (output: "exec") => void
  ): Promise<void> {
    const result = e.data as PortEventType;
    if (result.type === "error") {
      await this.logAndTerminate("error", result.message);
    }
    if (result.type === "openai") {
      const data = result.data;
      if ("type" in data) {
        // ストリーミングイベントの場合
        this.setEvent(data);
        this.controls.console.addValue(
          `Event: ${JSON.stringify(data, null, 2)}`
        );
        if (data.type === "error") {
          await this.logAndTerminate("error", data.message);
        } else if (data.type === "response.output_text.done") {
          this.setEvent(data);
          await this.logAndTerminate("done", data.text);
        } else if (data.type === "response.output_text.delta") {
          this.setEvent(data);
        }
      } else {
        // レスポンスの場合
        this.setResponse(data);
        this.controls.console.addValue(
          `Response: ${JSON.stringify(data, null, 2)}`
        );
        await this.logAndTerminate("done", data.output_text);
      }
    }
    forward("exec");
  }

  async execute(
    input: "exec" | "exec2",
    forward: (output: "exec") => void
  ): Promise<void> {
    if (input === "exec2") {
      await this.stopExecution();
    } else {
      await this.beginExecution(forward);
    }
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
