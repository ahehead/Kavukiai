import { BaseNode, type TypedSocket } from "renderer/nodeEditor/types";
import {
  toOpenAIEasy,
  type UChat,
  type OpenAIFileResolver,
} from "renderer/nodeEditor/types/Schemas/UChat/UChatMessage";
import { chatMessagesToResponseInput } from "renderer/nodeEditor/types/Schemas/ChatMessageItem";
import type { ResponseInput } from "renderer/nodeEditor/types/Schemas/openai/InputSchemas";

// UChat を OpenAI ResponseInput に変換するノード
export class UChatToOpenAINode extends BaseNode<
  "UChatToOpenAI",
  { uChat: TypedSocket },
  { out: TypedSocket },
  object
> {
  constructor() {
    super("UChatToOpenAI");
    this.addInputPort({ key: "uChat", typeName: "UChat", label: "UChat" });
    this.addOutputPort({ key: "out", typeName: "ResponseInput", label: "out" });
  }

  data(inputs: { uChat?: UChat[] }): { out: ResponseInput } {
    const chat = inputs.uChat?.[0] ?? [];
    const resolver: OpenAIFileResolver = {
      toImage: () => ({}),
      toFile: () => ({}),
    };
    const easy = toOpenAIEasy(chat, resolver) as any;
    return { out: chatMessagesToResponseInput(easy) };
  }

  async execute(): Promise<void> {}
}

