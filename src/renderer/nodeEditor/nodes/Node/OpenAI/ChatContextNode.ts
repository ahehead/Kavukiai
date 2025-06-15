import type { HistoryPlugin } from "rete-history-plugin";
import { BaseNode } from "renderer/nodeEditor/types/Node/BaseNode";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine } from "rete-engine";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";
import { ResponseInputMessageControl } from "../../Controls/OpenAI/ResponseInputMessage";
import type {
  AreaExtra,
  TypedSocket,
  Schemes,
} from "renderer/nodeEditor/types";
import type { ResponseInput } from "renderer/nodeEditor/types/Schemas/InputSchemas";
import type { ChatMessageItem } from "renderer/nodeEditor/types/Schemas/InputSchemas";
import type { SerializableDataNode } from "renderer/nodeEditor/types/Node/SerializableDataNode";
import { chatMessagesToResponseInput } from "renderer/nodeEditor/types/Schemas";

// open ai用のchat message list Node
export class ResponseInputMessageItemListNode
  extends BaseNode<
    {
      exec: TypedSocket;
      exec2: TypedSocket;
      systemPrompt: TypedSocket;
      newMessage: TypedSocket;
    },
    { exec: TypedSocket; out: TypedSocket },
    { chatContext: ResponseInputMessageControl }
  >
  implements SerializableDataNode
{
  constructor(
    initial: ChatMessageItem[],
    history: HistoryPlugin<Schemes>,
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>
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
        label: "add2",
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
    ]);
    this.addOutputPort([
      {
        key: "exec",
        typeName: "exec",
        label: "next",
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

  // dataflowで流す
  data(): { out: ResponseInput } {
    const messages = this.controls.chatContext.getValue();
    console.log("data", messages);
    return { out: chatMessagesToResponseInput(messages) };
  }

  async execute(
    input: "exec" | "exec2",
    forward: (output: "exec") => void
  ): Promise<void> {
    const { systemPrompt, newMessage } = (await this.dataflow.fetchInputs(
      this.id
    )) as {
      systemPrompt?: string[];
      newMessage?: ChatMessageItem[];
    };
    this.controls.chatContext.setSystemPrompt(systemPrompt?.[0] || "");
    if (newMessage?.length) {
      this.controls.chatContext.addMessage(newMessage[0]);
    }
    resetCacheDataflow(this.dataflow, this.id);
    forward("exec");
  }

  serializeControlValue(): { data: { list: ChatMessageItem[] } } {
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
