import type { HistoryPlugin } from "rete-history-plugin";
import { BaseNode } from "renderer/nodeEditor/types/Node/BaseNode";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine, DataflowEngine } from "rete-engine";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";
import { ResponseInputMessageControl } from "../../Controls/OpenAI/ResponseInputMessage";
import type {
  AreaExtra,
  TypedSocket,
  Schemes,
} from "renderer/nodeEditor/types";
import type { ChatMessageItem } from "renderer/nodeEditor/types/Schemas";
import { chatMessagesToResponseInput } from "renderer/nodeEditor/types/Schemas";
import type { SerializableDataNode } from "renderer/nodeEditor/types/Node/SerializableDataNode";
import type { OpenAIClientResponseOrNull } from "renderer/nodeEditor/types/Schemas";
import { ButtonControl } from "../../Controls/Button";
import type { EasyInputMessage } from "renderer/nodeEditor/types/Schemas/InputSchemas";

// open ai用のchat message list Node
export class ResponseInputMessageItemListNode
  extends BaseNode<
    {
      exec: TypedSocket;
      exec2: TypedSocket;
      systemPrompt: TypedSocket;
      newMessage: TypedSocket;
      responseList: TypedSocket;
    },
    { exec: TypedSocket; out: TypedSocket },
    { chatContext: ResponseInputMessageControl }
  >
  implements SerializableDataNode
{
  systemPrompt = ""; // システムプロンプト
  // 処理中messageのindex
  processingMessageIndex = 0;

  constructor(
    initial: ChatMessageItem[],
    history: HistoryPlugin<Schemes>,
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super("ResponseInputMessageItemList");
    this.addInputPort([
      {
        key: "exec",
        typeName: "exec",
        label: "add",
      },
      {
        key: "exec2",
        typeName: "exec",
        label: "response",
        control: new ButtonControl({
          label: "Response",
          onClick: async (e) => {
            e.stopPropagation();
            this.controlflow.execute(this.id, "exec2");
          },
        }),
      },
      {
        key: "systemPrompt",
        typeName: "string",
        label: "System Prompt",
      },
      {
        key: "newMessage",
        typeName: "ChatMessageItem",
        label: "New Message",
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
        label: "added",
      },

      {
        key: "out",
        typeName: "ResponseInput",
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

  // dataflowで流す (ChatMessageItem[] を ResponseInputMessageItem[] に変換)
  async data(): Promise<{
    out: ReturnType<typeof chatMessagesToResponseInput>;
  }> {
    const systemPromptMessage =
      this.controls.chatContext.createSystemPromptMessage(this.systemPrompt);
    const messages = this.controls.chatContext.getValue();
    const responseInputs = chatMessagesToResponseInput([
      systemPromptMessage,
      ...messages,
    ]);
    return { out: responseInputs };
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
  // systemPromptがあればそれを設定する
  private async updateChatContext(
    forward: (output: "exec") => void
  ): Promise<void> {
    // データフローから入力を取得
    const { systemPrompt, newMessage } = (await this.dataflow.fetchInputs(
      this.id
    )) as { systemPrompt?: string[]; newMessage?: ChatMessageItem[] };

    if (!!systemPrompt && systemPrompt.length > 0) {
      this.systemPrompt = systemPrompt[0];
    }
    if (!!newMessage && newMessage.length > 0) {
      this.controls.chatContext.addMessage(newMessage[0]);
    }
    await this.area?.update("node", this.id);
    forward("exec");
  }

  // openai clientのレスポンスを処理する
  private async executeChatResponseHandling(): Promise<void> {
    const inpu = (await this.dataflow.fetchInputs(this.id)) as {
      responseList?: OpenAIClientResponseOrNull[];
    };
    console.log("input", inpu);
    const responseList = inpu.responseList || [];
    console.log("response", responseList);
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
                tokens: response.usage?.output_tokens,
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
        tokens: response.usage?.output_tokens,
      });
    }
  }

  serializeControlValue(): {
    data: { systemPrompt: string; list: ChatMessageItem[] };
  } {
    return {
      data: {
        systemPrompt: this.systemPrompt,
        list: this.controls.chatContext.getValue(),
      },
    };
  }

  deserializeControlValue(data: {
    systemPrompt: string;
    list: ChatMessageItem[];
  }): void {
    this.systemPrompt = data.systemPrompt;
    this.controls.chatContext.setValue(data.list);
  }
}
