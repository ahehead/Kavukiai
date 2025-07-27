import type { TypedSocket } from "renderer/nodeEditor/types";
import { BaseNode } from "renderer/nodeEditor/types/Node/BaseNode";
import {
  type ChatMessageItem,
  chatMessageToString,
} from "renderer/nodeEditor/types/Schemas/ChatMessageItem";

export class ChatMessageListToStringNode extends BaseNode<
  "ChatMessageListToString",
  {
    list: TypedSocket;
    isAddRole: TypedSocket;
    userString: TypedSocket;
    assistantString: TypedSocket;
  },
  { out: TypedSocket },
  object
> {
  constructor() {
    super("ChatMessageListToString");
    this.addInputPort([
      { key: "list", typeName: "ChatMessageItemList", label: "list" },
      { key: "isAddRole", typeName: "boolean", label: "add role" },
      { key: "userString", typeName: "string", label: "user" },
      { key: "assistantString", typeName: "string", label: "assistant" },
    ]);
    this.addOutputPort({ key: "out", typeName: "string", label: "out" });
  }

  data(inputs?: {
    list?: ChatMessageItem[][];
    isAddRole?: boolean[];
    userString?: string[];
    assistantString?: string[];
  }): { out: string } {
    const messages = inputs?.list?.[0] ?? [];
    const addRole = inputs?.isAddRole?.[0] ?? false;
    const userLabel = inputs?.userString?.[0] ?? "User";
    const assistantLabel = inputs?.assistantString?.[0] ?? "Assistant";
    let result = "";
    for (const msg of messages) {
      const text = chatMessageToString(msg);
      const role = msg.role === "user" ? userLabel : msg.role === "assistant" ? assistantLabel : msg.role;
      result += addRole ? `${role}\n${text}\n\n` : `${text}\n\n`;
    }
    return { out: result.trimEnd() };
  }

  async execute(): Promise<void> {}
}
