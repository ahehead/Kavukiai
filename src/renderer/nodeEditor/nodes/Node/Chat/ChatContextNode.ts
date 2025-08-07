import type { DataflowEngine } from "renderer/nodeEditor/features/safe-dataflow/dataflowEngin";
import type {
  AreaExtra,
  Schemes,
  TypedSocket,
} from "renderer/nodeEditor/types";
import type { SerializableDataNode } from "renderer/nodeEditor/types/Node/SerializableDataNode";
import { SerializableInputsNode } from "renderer/nodeEditor/types/Node/SerializableInputsNode";
import type { ChatCommandEventOrNull } from "renderer/nodeEditor/types/Schemas/ChatCommandEvent";
import type {
  ChatMessageItem,
  ChatMessageItemList,
} from "renderer/nodeEditor/types/Schemas/ChatMessageItem";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine } from "rete-engine";
import type { HistoryPlugin } from "rete-history-plugin";
import {
  ChatMessageListControl,
  type DeltaFunctions,
} from "../../Controls/Chat/ChatMessageList";

// open ai用のchat message list Node
export class ChatMessageListNode
  extends SerializableInputsNode<
    "ChatMessageList",
    {
      systemPrompt: TypedSocket;
      exec: TypedSocket;
      newMessage: TypedSocket;
      exec2: TypedSocket;
      event: TypedSocket;
    },
    { exec: TypedSocket; out: TypedSocket; exec2: TypedSocket },
    { chatContext: ChatMessageListControl }
  >
  implements SerializableDataNode
{
  deltaFunc: DeltaFunctions;

  constructor(
    initial: ChatMessageItem[],
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super("ChatMessageList");
    this.addInputPort([
      { key: "systemPrompt", typeName: "string", label: "System Prompt" },
      {
        key: "exec",
        typeName: "exec",
        label: "push",
        onClick: () => this.controlflow.execute(this.id, "exec"),
      },
      { key: "newMessage", typeName: "ChatMessageItem", label: "New Message" },
      {
        key: "exec2",
        typeName: "exec",
        label: "response",
        onClick: () => this.controlflow.execute(this.id, "exec2"),
      },
      { key: "event", typeName: "ChatCommandEventOrNull", label: "Event" },
    ]);
    this.addOutputPort([
      {
        key: "exec",
        typeName: "exec",
        label: "pushed",
      },
      {
        key: "out",
        typeName: "ChatMessageItemList",
      },
      {
        key: "exec2",
        typeName: "exec",
        label: "responsed",
      },
    ]);
    const control = new ChatMessageListControl({
      value: initial,
      editable: true,
      history: history,
      area: area,
      onChange: () => {
        dataflow.reset(this.id);
      },
    });
    this.deltaFunc = control.setupDeltaFunctions();

    this.addControl("chatContext", control);
  }

  // dataWithFetchが優先される
  data() {
    return {};
  }

  // systemPrompt入力からのみfetchする
  async dataWithFetch(
    fetchInputs: (
      keys?: readonly string[]
    ) => Promise<{ systemPrompt?: string[] }>
  ): Promise<{
    out: ChatMessageItemList;
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
    input: "exec" | "exec2",
    forward: (output: "exec" | "exec2") => void
  ): Promise<void> {
    if (input === "exec") {
      await this.addMessageToContext(forward);
    } else if (input === "exec2") {
      await this.handleCommandEvent(forward);
    }
  }

  // messageを追加する
  private async addMessageToContext(
    forward: (output: "exec") => void
  ): Promise<void> {
    // データフローから単一の入力を取得
    const newMessage = await this.dataflow.fetchInputSingle<ChatMessageItem>(
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
    const event = await this.dataflow.fetchInputSingle<ChatCommandEventOrNull>(
      this.id,
      "event"
    );
    if (!event) {
      return;
    }
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
        this.deltaFunc.finish(event.text);
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

  serializeControlValue(): {
    data: { list: ChatMessageItem[] };
  } {
    return {
      data: {
        list: this.controls.chatContext.getValue(),
      },
    };
  }

  deserializeControlValue(data: { list: ChatMessageItem[] }): void {
    this.controls.chatContext.setValue(data.list);
  }
}
