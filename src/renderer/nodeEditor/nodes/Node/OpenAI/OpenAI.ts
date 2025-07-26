import type OpenAI from "openai";
import { electronApiService } from "renderer/features/services/appService";
import type { DataflowEngine } from "renderer/nodeEditor/features/safe-dataflow/dataflowEngin";
import type {
  AreaExtra,
  Schemes,
  TypedSocket,
} from "renderer/nodeEditor/types";
import { MessagePortNode } from "renderer/nodeEditor/types/Node/MessagePortNode";
import type { OpenAIClientResponse } from "renderer/nodeEditor/types/Schemas/Util";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine } from "rete-engine";
import type { OpenAIRequestArgs, PortEventType } from "shared/ApiType";
import type { ControlJson } from "shared/JsonType";
import { ConsoleControl } from "../../Controls/Console";

// Run ノード
export class OpenAINode extends MessagePortNode<
  "OpenAI",
  { exec: TypedSocket; exec2: TypedSocket; param: TypedSocket },
  { exec: TypedSocket; response: TypedSocket },
  { console: ConsoleControl },
  PortEventType,
  OpenAIRequestArgs
> {
  // OpenAi Clientのレスポンスを保持する
  response: OpenAIClientResponse | null = null;

  constructor(
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>,
    controlflow: ControlFlowEngine<Schemes>
  ) {
    super("OpenAI", area, dataflow, controlflow);
    this.addInputPortPattern({
      type: "RunButton",
      controlflow: this.controlflow,
    });
    this.addInputPort([
      {
        key: "exec2",
        typeName: "exec",
        label: "Stop",
        onClick: () => this.controlflow.execute(this.id, "exec2"),
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
    this.dataflow.reset(this.id);
  }

  protected async buildRequestArgs(): Promise<OpenAIRequestArgs | null> {
    const { param } = (await this.dataflow.fetchInputs(this.id)) as {
      param?: OpenAI.Responses.ResponseCreateParams[];
    };
    if (!param || param.length === 0) return null;
    return { id: this.id, param: param[0] };
  }

  data(): { response: OpenAIClientResponse | null } {
    return { response: this.response };
  }

  protected async onPortEvent(
    evt: PortEventType,
    forward: (output: "exec") => void
  ): Promise<void> {
    // エラーは即終了
    if (evt.type === "error") {
      return this.logAndTerminate("error", evt.message, forward);
    }
    // OpenAI イベント以外はerror終了
    if (evt.type !== "openai") {
      return this.logAndTerminate("error", "Not OpenAI event", forward);
    }

    const data = evt.data;
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

  protected onLog(msg: string) {
    this.controls.console.addValue(msg);
  }

  protected callMain(args: OpenAIRequestArgs): void {
    electronApiService.sendChatGptMessage(args);
  }

  serializeControlValue(): ControlJson {
    return this.controls.console.toJSON();
  }

  deserializeControlValue(data: ControlJson): void {
    this.controls.console.setFromJSON({ data });
  }
}
