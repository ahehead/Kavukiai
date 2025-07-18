import type OpenAI from "openai";
import { electronApiService } from "renderer/features/services/appService";
import {
  type AreaExtra,
  NodeStatus,
  type Schemes,
  type TypedSocket,
} from "renderer/nodeEditor/types";
import { SerializableInputsNode } from "renderer/nodeEditor/types/Node/SerializableInputsNode";
import type { OpenAIClientResponse } from "renderer/nodeEditor/types/Schemas";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine, DataflowEngine } from "rete-engine";
import type { OpenAIRequestArgs, PortEventType } from "shared/ApiType";
import type { ControlJson } from "shared/JsonType";
import { ButtonControl } from "../../Controls/Button";
import { ConsoleControl } from "../../Controls/Console";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";

// Run ノード
export class OpenAINode extends SerializableInputsNode<
  "OpenAI",
  { exec: TypedSocket; exec2: TypedSocket; param: TypedSocket },
  { exec: TypedSocket; response: TypedSocket },
  { console: ConsoleControl }
> {
  port: MessagePort | null = null;
  // OpenAi Clientのレスポンスを保持する
  response: OpenAIClientResponse | null = null;
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
        key: "response",
        typeName: "OpenAIClientResponseOrNull",
        label: "Response",
      },
    ]);
    this.addControl("console", new ConsoleControl({}));
  }

  setResponse(response: OpenAIClientResponse): void {
    this.response = response;
    resetCacheDataflow(this.dataflow, this.id);
  }

  // portのclose処理
  closePort(): void {
    if (this.port) {
      this.port.close();
      this.port = null;
    }
  }

  data(): { response: OpenAIClientResponse | null } {
    return { response: this.response || null };
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

  // 通信Stop処理
  private async stopExecution(): Promise<void> {
    if (this.status === NodeStatus.RUNNING && this.port) {
      const message: PortEventType = { type: "abort" };
      this.port.postMessage(message);
      this.closePort();
      await this.setStatus(this.area, NodeStatus.IDLE);
      this.controls.console.addValue("Stop");
    } else if (this.status === NodeStatus.RUNNING) {
      await this.setStatus(this.area, NodeStatus.IDLE);
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
      await this.logAndTerminate("error", "No param", forward);
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
    // エラーは即終了
    if (result.type === "error") {
      return this.logAndTerminate("error", result.message, forward);
    }
    // OpenAI イベント以外はerror終了
    if (result.type !== "openai") {
      return this.logAndTerminate("error", "Not OpenAI event", forward);
    }

    const data = result.data;
    this.setResponse(data);

    // ストリーミング or 完了レスポンス
    if ("type" in data) {
      this.controls.console.addValue(`Event type: ${data.type}`);
      switch (data.type) {
        case "error":
          return this.logAndTerminate("error", data.message, forward);
        case "response.failed":
          this.controls.console.addValue(
            `Failed: ${data.response.error?.code} - ${data.response.error?.message}`
          );
          return this.logAndTerminate("error", "response.failed", forward);
        case "response.output_text.done":
          return this.logAndTerminate("done", data.text, forward);
        case "response.completed":
          this.controls.console.addValue(
            `Response completed: ${JSON.stringify(data, null, 2)}`
          );
          break;
        default:
          break;
      }
    } else {
      // 非ストリーミング完了レスポンス
      this.controls.console.addValue(
        `Response: ${JSON.stringify(data, null, 2)}`
      );
      return this.logAndTerminate("done", data.output_text, forward);
    }

    // 通常ストリーミング中の次イベント待ち
    forward("exec");
  }

  //errorとdoneのときの終了処理
  async logAndTerminate(
    type: "error" | "done",
    message: string,
    forward: (output: "exec") => void
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
      forward("exec");
    }
    this.closePort();
  }

  serializeControlValue(): ControlJson {
    return this.controls.console.toJSON();
  }

  deserializeControlValue(data: ControlJson): void {
    this.controls.console.setFromJSON({ data });
  }
}

// message eventを使ってelectron MessagePortをやり取りする関数
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
