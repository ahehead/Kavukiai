import type { DataflowEngine } from "renderer/nodeEditor/features/safe-dataflow/dataflowEngin";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine } from "rete-engine";
import type { AreaExtra, Schemes } from "../Schemes";
import type { TypedSocket } from "../TypedSocket";
import { NodeStatus } from "./BaseNode";
import { SerializableInputsNode } from "./SerializableInputsNode";

/**
 * 汎用的な「Port を使うノード」の抽象基底
 */
export abstract class MessagePortNode<
  Name extends string,
  Inputs extends Record<string, TypedSocket>,
  Outputs extends Record<string, TypedSocket>,
  Controls extends Record<string, any>,
  PortEvent,
  RequestArgs extends { id: string },
  ExecInKey extends keyof Inputs = "exec" | "exec2",
  ExecOutKey extends keyof Outputs = "exec"
> extends SerializableInputsNode<Name, Inputs, Outputs, Controls> {
  public port: MessagePort | null = null;

  protected constructor(
    name: Name,
    protected area: AreaPlugin<Schemes, AreaExtra>,
    protected dataflow: DataflowEngine<Schemes>,
    protected controlflow: ControlFlowEngine<Schemes>
  ) {
    super(name);
  }

  /* ========= テンプレートメソッド ========= */

  async execute(input: ExecInKey, forward: (o: ExecOutKey) => void) {
    if (input === "exec2") return this.stopExecution();
    return this.beginExecution(forward);
  }

  /** 共通の停止ロジック */
  protected async stopExecution() {
    if (this.status === NodeStatus.RUNNING && this.port) {
      this.port.postMessage({ type: "abort" });
      this.port.close();
      this.port = null;
      await this.setStatus(this.area, NodeStatus.IDLE);
      this.onLog("Stop");
    } else if (this.status === NodeStatus.RUNNING) {
      await this.setStatus(this.area, NodeStatus.IDLE);
    } else {
      this.onLog("Already stopped");
    }
  }

  /** 実際の処理開始（サブクラス固有部を呼び出す） */
  private async beginExecution(forward: (o: ExecOutKey) => void) {
    if (this.status === NodeStatus.RUNNING) {
      this.onLog("Already running");
      return;
    }
    await this.setStatus(this.area, NodeStatus.RUNNING);

    const maybeArgs = await this.buildRequestArgs();
    if (!maybeArgs) {
      await this.logAndTerminate("error", "Missing parameter", forward);
      return;
    }
    this.onLog("Start");

    this.port = await this.openPort({ ...maybeArgs, id: this.id });
    this.port.onmessage = (e) =>
      this.onPortEvent(e.data as PortEvent, forward).catch((err) =>
        this.logAndTerminate("error", String(err), forward)
      );
  }

  /* ========= 共通ユーティリティ ========= */

  protected async logAndTerminate(
    kind: "error" | "done",
    message: string,
    forward: (o: ExecOutKey) => void
  ) {
    if (this.port) {
      this.port.close();
      this.port = null;
    }
    this.onLog(`${kind === "error" ? "Error" : "Done"}: ${message}`);
    await this.setStatus(
      this.area,
      kind === "error" ? NodeStatus.ERROR : NodeStatus.COMPLETED
    );
    if (kind === "done") forward("exec" as ExecOutKey);
  }

  /** 汎用ポート生成。subclass からは await this.openPort(args) と呼ぶだけ */
  protected openPort(args: RequestArgs): Promise<MessagePort> {
    return new Promise((resolve) => {
      const handler = (e: MessageEvent) => {
        if (e.data?.type === "node-port" && e.data.id === args.id) {
          window.removeEventListener("message", handler);
          const [port] = e.ports;
          port.start();
          resolve(port);
        }
      };
      window.addEventListener("message", handler);
      this.callMain(args); // ← サブクラス実装を呼ぶ
    });
  }

  /* ========= サブクラスが実装するフック ========= */

  /** window から渡って来る PortEvent をどう解釈するか */
  protected abstract onPortEvent(
    evt: PortEvent,
    forward: (o: ExecOutKey) => void
  ): Promise<void>;

  /** dataflow から取り出した入力を Port リクエスト引数に変換 */
  protected abstract buildRequestArgs(): Promise<RequestArgs | null>;

  /** console などへのログ出力 */
  protected abstract onLog(msg: string): void;

  /** 各ノード固有の main‑process 呼び出しを返す */
  protected abstract callMain(args: RequestArgs): void;
}
