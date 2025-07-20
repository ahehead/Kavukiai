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
import type { ControlFlowEngine, DataflowEngine } from "rete-engine";
import type { HistoryPlugin } from "rete-history-plugin";
import { ResponseInputMessageControl } from "../../Controls/OpenAI/ResponseInputMessage";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";

// open ai用のchat message list Node
export class ChatMessageListNode
  extends SerializableInputsNode<
    "ChatMessageList",
    {
      systemPrompt: TypedSocket;
      exec: TypedSocket;
      newMessage: TypedSocket;
      exec2: TypedSocket;
      responseList: TypedSocket;
    },
    { exec: TypedSocket; out: TypedSocket },
    { chatContext: ResponseInputMessageControl }
  >
  implements SerializableDataNode
{
  // 処理中messageのindex
  processingMessageIndex = 0;

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
        key: "responseList",
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
    this.addControl(
      "chatContext",
      new ResponseInputMessageControl({
        value: initial,
        editable: true,
        history: history,
        area: area,
        onChange: () => {
          resetCacheDataflow(dataflow, this.id);
        },
      })
    );
  }

  // dataflowで流す
  async data(inputs?: { systemPrompt?: string[] }): Promise<{
    out: ChatMessageItemList;
  }> {
    const systemPrompt = inputs?.systemPrompt?.[0] || "";
    const systemPromptMessage =
      this.controls.chatContext.createSystemPromptMessage(systemPrompt);
    const messages = this.controls.chatContext.getValue();
    return { out: [systemPromptMessage, ...messages] };
  }

  async execute(
    input: "exec" | "exec2",
    forward: (output: "exec") => void
  ): Promise<void> {
    if (input === "exec") {
      await this.updateChatContext(forward);
    } else if (input === "exec2") {
      await this.executeChatResponseHandling();
    }
  }

  // messageを追加する
  private async updateChatContext(
    forward: (output: "exec") => void
  ): Promise<void> {
    // データフローから入力を取得
    const { newMessage } = (await this.dataflow.fetchInputs(this.id)) as {
      newMessage?: ChatMessageItem[];
    };
    if (!!newMessage && newMessage.length > 0) {
      this.controls.chatContext.addMessage(newMessage[0]);
    }
    forward("exec");
  }

  // openai clientのレスポンスを処理する
  private async executeChatResponseHandling(): Promise<void> {
    const inpu = (await this.dataflow.fetchInputs(this.id)) as {
      responseList?: OpenAIClientResponseOrNull[];
    };
    const responseList = inpu.responseList || [];
    if (!responseList || responseList.length === 0 || !responseList[0]) return;
    const response = responseList[0];
    // レスポンスがイベント形式の場合
    if ("type" in response) {
      if (response.type === "response.created") {
        this.processingMessageIndex = this.controls.chatContext.addTempMessage({
          content: "",
          role: "assistant",
          type: "message",
          model: response.response.model,
          created_at: response.response.created_at,
        } as EasyInputMessage as ChatMessageItem);
      } else if (response.type === "response.output_item.added") {
        if (response.item.type !== "message") return;
        this.controls.chatContext.setTempMessageId(
          this.processingMessageIndex,
          response.item.id
        );
      } else if (response.type === "response.output_text.delta") {
        this.controls.chatContext.modifyMessageTextDelta(
          this.processingMessageIndex,
          response.delta
        );
      } else if (response.type === "response.output_text.done") {
        this.controls.chatContext.modifyMessageTextDone(
          this.processingMessageIndex,
          response.text
        );
        this.processingMessageIndex = 0; // 処理中のメッセージインデックスをリセット
      }
    } else {
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

      // レスポンスが直接返ってきた場合
      this.controls.chatContext.addMessage({
        id: response.id,
        content: [{ type: "input_text", text: response.output_text }],
        role: "assistant",
        type: "message",
        model: response.model,
        created_at: response.created_at,
        tokensCount: response.usage?.output_tokens,
      });
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
