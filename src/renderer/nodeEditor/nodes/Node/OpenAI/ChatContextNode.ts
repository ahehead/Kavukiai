import type { HistoryPlugin } from "rete-history-plugin";
import { BaseNode } from "renderer/nodeEditor/types/Node/BaseNode";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine } from "rete-engine";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";
import { ResponseInputMessageControl } from "../../Controls/ChatContext/ResponseInput";
import type {
  AreaExtra,
  TypedSocket,
  Schemes,
} from "renderer/nodeEditor/types";
import {
  chatMessagesToResponseInput,
  ResponseInput,
} from "renderer/nodeEditor/types/Schemas/InputSchemas";
import { ChatMessageItem } from "renderer/nodeEditor/types/Schemas/InputSchemas";
import { Type } from "@sinclair/typebox";

// 長文文字列入力ノード
export class ChatContextNode extends BaseNode<
  {
    exec: TypedSocket;
    exec2: TypedSocket;
    systemPrompt: TypedSocket;
    newMessage: TypedSocket;
  },
  { exec: TypedSocket; out: TypedSocket },
  { chatContext: ResponseInputMessageControl }
> {
  constructor(
    initial: ChatMessageItem[],
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>
  ) {
    super("ChatContext");
    this.addInputPort([
      {
        key: "exec",
        name: "exec",
        label: "add",
        schema: Type.Literal("exec"),
      },
      {
        key: "exec2",
        name: "exec",
        label: "add2",
        schema: Type.Literal("exec"),
      },
      {
        key: "systemPrompt",
        name: "string",
        label: "System Prompt",
        schema: Type.String(),
      },
      {
        key: "newMessage",
        name: "ResponseInputMessageItem",
        label: "New Message",
        schema: ChatMessageItem,
      },
    ]);
    this.addOutputPort([
      {
        key: "exec",
        name: "exec",
        label: "next",
        schema: Type.Literal("exec"),
      },

      {
        key: "out",
        name: "ResponseInput",
        schema: ResponseInput,
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
}
