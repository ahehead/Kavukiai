import type { TypedSocket } from "renderer/nodeEditor/types";
import { BaseNode } from "renderer/nodeEditor/types/Node/BaseNode";

import {
  type ChatMessageItem,
  chatMessagesToResponseInput,
} from "renderer/nodeEditor/types/Schemas";
import type { ResponseInput } from "renderer/nodeEditor/types/Schemas/openai/InputSchemas";

export class ChatMessageListToOpenAIInput extends BaseNode<
  "ChatMessageListToOpenAIInput",
  { list: TypedSocket },
  { out: TypedSocket },
  Record<string, never>
> {
  constructor() {
    super("ChatMessageListToOpenAIInput");
    this.addInputPort({
      key: "list",
      typeName: "ChatMessageItemList",
      label: "list",
    });
    this.addOutputPort({ key: "out", typeName: "ResponseInput", label: "out" });
  }

  data(inputs?: { list?: ChatMessageItem[][] }): { out: ResponseInput } {
    const messages = inputs?.list?.[0] ?? [];
    return { out: chatMessagesToResponseInput(messages) };
  }

  async execute(): Promise<void> {}
}
