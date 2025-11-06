import type { ChatHistoryData } from "@nodes/LMStudio/common/schema/LMStudioSchemas";
import {
  SerializableInputsNode,
  type TypedSocket,
} from "renderer/nodeEditor/types";
import {
  type LMFileResolver,
  toLMHistory,
} from "@nodes/Chat/common/schema";
import type {
  UChat,
  UFileRef,
} from "@nodes/Chat/common/schema/UChatMessage";

// UChat を LM Studio ChatHistoryData に変換するノード
export class UChatToLMStudioNode extends SerializableInputsNode<
  "UChatToLMStudio",
  { uChat: TypedSocket },
  { chatHistory: TypedSocket },
  object
> {
  constructor() {
    super("UChatToLMStudio");
    this.addInputPort({ key: "uChat", typeName: "UChat", label: "UChat" });
    this.addOutputPort({
      key: "chatHistory",
      typeName: "ChatHistoryData",
      label: "chatHistory",
    });
  }

  data(inputs: { uChat?: UChat[] }): { chatHistory: ChatHistoryData } {
    const chat = inputs.uChat?.[0] ?? [];

    // LMFileResolver の実装
    const resolver: LMFileResolver = {
      toFilePart: (
        _ref: UFileRef,
        hint?: { isImage?: boolean; name?: string }
      ) => {
        // 基本的な実装
        const name = hint?.name || "file";
        const identifier = "";

        return {
          type: "file",
          name,
          identifier,
          fileType: hint?.isImage ? "image" : undefined,
        };
      },
    };

    const chatHistory = toLMHistory(chat, resolver);
    return { chatHistory };
  }
}

