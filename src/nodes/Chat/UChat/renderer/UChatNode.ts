import type { DataflowEngine } from "renderer/nodeEditor/features/safe-dataflow/dataflowEngin";
import type {
  AreaExtra,
  Schemes,
  TypedSocket,
} from "renderer/nodeEditor/types";
import type { SerializableDataNode } from "renderer/nodeEditor/types/Node/SerializableDataNode";
import { SerializableInputsNode } from "renderer/nodeEditor/types/Node/SerializableInputsNode";
import type { UChatCommandEventOrNull } from "@nodes/Chat/common/schema/UChatCommand";
import type {
  UChat,
  UChatMessage,
} from "@nodes/Chat/common/schema/UChatMessage";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine } from "rete-engine";
import type { HistoryPlugin } from "rete-history-plugin";
import {
  type DeltaStreamFunctions,
  UChatControl,
} from "renderer/nodeEditor/nodes/Controls/Chat/UChat";

// open aiと lmstudioに変換できる
export class UChatNode
  extends SerializableInputsNode<
    "UChat",
    {
      systemPrompt: TypedSocket;
      exec: TypedSocket;
      newMessage: TypedSocket;
      exec2: TypedSocket;
      event: TypedSocket;
      exec3: TypedSocket;
      newValue: TypedSocket;
    },
    { exec: TypedSocket; out: TypedSocket; exec2: TypedSocket },
    { chatContext: UChatControl }
  >
  implements SerializableDataNode
{
  deltaFunc: DeltaStreamFunctions;

  constructor(
    initial: UChat,
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super("UChat");
    this.width = 500;
    this.height = 700;
    this.addInputPort([
      { key: "systemPrompt", typeName: "string", label: "System Prompt" },
      {
        key: "exec",
        label: "Push Message",
        onClick: () => this.controlflow.execute(this.id, "exec"),
      },
      { key: "newMessage", typeName: "UChatMessage", label: "New Message" },
      {
        key: "exec2",
        label: "Event",
        showControl: false,
        onClick: () => this.controlflow.execute(this.id, "exec2"),
      },
      { key: "event", typeName: "UChatCommandEventOrNull", label: "Event" },
      {
        key: "exec3",
        label: "Reset",
        onClick: () => this.controlflow.execute(this.id, "exec3"),
      },
      { key: "newValue", typeName: "UChat", label: "Reset UChat" },
    ]);
    this.addOutputPort([
      {
        key: "exec",
        typeName: "exec",
        label: "pushed",
      },
      {
        key: "out",
        typeName: "UChat",
      },
      {
        key: "exec2",
        typeName: "exec",
        label: "responsed",
      },
    ]);
    const control = new UChatControl({
      value: initial,
      editable: true,
      history,
      area,
      onChange: () => {
        dataflow.reset(this.id);
      },
    });
    this.deltaFunc = control.setupDeltaFunctions();

    this.addControl("chatContext", control);
  }

  // systemPrompt入力からのみfetchする
  async dataWithFetch(
    fetchInputs: (
      keys?: readonly string[]
    ) => Promise<{ systemPrompt?: string[] }>
  ): Promise<{
    out: UChat;
  }> {
    const result = await fetchInputs(["systemPrompt"]);
    const systemPrompt = result?.systemPrompt?.[0] || "";
    return {
      out: systemPrompt
        ? this.controls.chatContext.getMessagesWithSystemPrompt(systemPrompt)
        : this.controls.chatContext.getValue(),
    };
  }

  async execute(
    input: "exec" | "exec2" | "exec3",
    forward: (output: "exec" | "exec2") => void
  ): Promise<void> {
    if (input === "exec") {
      await this.addMessageToContext(forward);
    } else if (input === "exec2") {
      await this.handleCommandEvent(forward);
    } else if (input === "exec3") {
      await this.resetChatValue();
    }
  }

  // messageを追加する
  private async addMessageToContext(
    forward: (output: "exec") => void
  ): Promise<void> {
    // データフローから単一の入力を取得
    const newMessage = await this.dataflow.fetchInputSingle<UChatMessage>(
      this.id,
      "newMessage"
    );
    if (newMessage !== null) {
      this.controls.chatContext.addMessage(newMessage);
    }
    forward("exec");
  }

  // ChatCommandEvent を処理
  private async handleCommandEvent(
    forward: (output: "exec2") => void
  ): Promise<void> {
    const event = await this.dataflow.fetchInputSingle<UChatCommandEventOrNull>(
      this.id,
      "event"
    );
    if (!event) return;

    switch (event.type) {
      case "start":
        this.deltaFunc.start(event.message);
        break;
      case "setInfo":
        this.deltaFunc.setInfo(event.message);
        break;
      case "delta":
        this.deltaFunc.pushDelta(event.delta);
        break;
      case "finish":
        this.deltaFunc.finish(event.text, event.message);
        forward("exec2");
        break;
      case "error":
        this.deltaFunc.finish();
        break;
      case "response":
        for (const msg of event.messages) {
          this.controls.chatContext.addMessage(msg);
        }
        forward("exec2");
        break;
    }
  }

  // チャットの値をリセット
  private async resetChatValue(): Promise<void> {
    this.controls.chatContext.clear();
    const newValue = await this.dataflow.fetchInputSingle<UChat>(
      this.id,
      "newValue"
    );
    if (newValue !== null) {
      this.controls.chatContext.setValue(
        newValue.filter((m) => m.role !== "system")
      );
    }
  }

  serializeControlValue(): {
    data: { list: UChat };
  } {
    return {
      data: {
        list: this.controls.chatContext.getValue(),
      },
    };
  }

  deserializeControlValue(data: { list: UChat }): void {
    this.controls.chatContext.setValue(data.list);
  }
}

