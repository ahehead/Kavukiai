import type { TypedSocket } from "renderer/nodeEditor/types";
import { BaseNode } from "renderer/nodeEditor/types/Node/BaseNode";
import type { ChatMessageItem } from "renderer/nodeEditor/types/Schemas/ChatMessageItem";

export class ReverseUserAssistantRoleNode extends BaseNode<
  "ReverseUserAssistantRole",
  { list: TypedSocket },
  { list: TypedSocket },
  object
> {
  constructor() {
    super("ReverseUserAssistantRole");
    this.addInputPort({ key: "list", typeName: "ChatMessageItemList", label: "list" });
    this.addOutputPort({ key: "list", typeName: "ChatMessageItemList", label: "list" });
  }

  data(inputs?: { list?: ChatMessageItem[][] }): { list: ChatMessageItem[] } {
    const messages = inputs?.list?.[0] ?? [];
    const out = messages.map((m) => {
      if (m.role === "user") return { ...m, role: "assistant" } as ChatMessageItem;
      if (m.role === "assistant") return { ...m, role: "user" } as ChatMessageItem;
      return m;
    });
    return { list: out };
  }

  async execute(): Promise<void> {}
}
