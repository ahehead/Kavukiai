import {
  SerializableInputsNode,
  type TypedSocket,
} from "renderer/nodeEditor/types";
import type { ResponseInput } from "renderer/nodeEditor/types/Schemas/openai/InputSchemas";
import {
  type OpenAIFileResolver,
  toOpenAIEasy,
  type UChat,
} from "renderer/nodeEditor/types/Schemas/UChat/UChatMessage";

// UChat を OpenAI ResponseInput に変換するノード
export class UChatToOpenAINode extends SerializableInputsNode<
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
    const easy = toOpenAIEasy(chat, resolver) as ResponseInput;
    return { out: easy };
  }

  async execute(): Promise<void> {}
}
