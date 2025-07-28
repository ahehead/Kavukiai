import type { DataflowEngine } from "renderer/nodeEditor/features/safe-dataflow/dataflowEngin";
import type {
  AreaExtra,
  Schemes,
  TypedSocket,
} from "renderer/nodeEditor/types";
import type { SerializableDataNode } from "renderer/nodeEditor/types/Node/SerializableDataNode";
import { SerializableInputsNode } from "renderer/nodeEditor/types/Node/SerializableInputsNode";
import type {
  ChatMessageItem,
  ChatMessageItemList,
} from "renderer/nodeEditor/types/Schemas/ChatMessageItem";
import type { EasyInputMessage } from "renderer/nodeEditor/types/Schemas/openai/InputSchemas";
import type { OpenAIClientResponseOrNull } from "renderer/nodeEditor/types/Schemas/Util";
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
      responseData: TypedSocket;
    },
    { exec: TypedSocket; out: TypedSocket },
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
      {
        key: "systemPrompt",
        typeName: "string",
        label: "System Prompt",
      },
      {
        key: "exec",
        typeName: "exec",
        label: "push",
        onClick: () => this.controlflow.execute(this.id, "exec"),
      },
      {
        key: "newMessage",
        typeName: "ChatMessageItem",
        label: "New Message",
      },
      {
        key: "exec2",
        typeName: "exec",
        label: "response",
      },
      {
        key: "responseData",
        typeName: "OpenAIClientResponseOrNull",
        label: "Response",
      },
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
    forward: (output: "exec") => void
  ): Promise<void> {
    if (input === "exec") {
      await this.addMessageToContext(forward);
    } else if (input === "exec2") {
      await this.executeChatResponseHandling();
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

  // openai clientのレスポンスを処理する
  private async executeChatResponseHandling(): Promise<void> {
    const response =
      await this.dataflow.fetchInputSingle<OpenAIClientResponseOrNull>(
        this.id,
        "responseData"
      );
    if (response === null) return;
    // レスポンスがイベント形式の場合
    if ("type" in response) {
      switch (response.type) {
        case "response.created":
          this.deltaFunc.start({
            model: response.response.model,
            created_at: response.response.created_at,
          });
          break;
        case "response.output_item.added":
          if (response.item.type !== "message") return;
          this.deltaFunc.setId(response.item.id);
          break;
        case "response.output_text.delta":
          this.deltaFunc.pushDelta(response.delta);
          break;
        case "response.output_text.done":
          this.deltaFunc.finish(response.text);
          break;
        default:
          break;
      }
    } else {
      // レスポンスが直接返ってきた場合

      // outputは複数ある場合がある
      for (const item of response.output) {
        if (item.type === "message") {
          for (const content of item.content) {
            if (content.type === "output_text") {
              this.controls.chatContext.addMessage({
                id: item.id,
                content: content.text,
                role: item.role,
                type: "message",
                model: response.model,
                created_at: response.created_at,
                tokensCount: response.usage?.output_tokens,
              } as EasyInputMessage as ChatMessageItem);
            }
          }
        }
      }
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
