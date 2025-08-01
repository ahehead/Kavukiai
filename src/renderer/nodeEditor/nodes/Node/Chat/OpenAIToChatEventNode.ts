import { BaseNode, type TypedSocket } from "renderer/nodeEditor/types";
import type {
  ChatCommandEvent,
  ChatCommandEventOrNull,
} from "renderer/nodeEditor/types/Schemas/ChatCommandEvent";
import type { ChatMessageItem } from "renderer/nodeEditor/types/Schemas/ChatMessageItem";
import type { OpenAIClientResponseOrNull } from "renderer/nodeEditor/types/Schemas/Util";

// OpenAIClientResponseOrNull を ChatCommandEvent に変換するノード
export class OpenAIToChatEventNode extends BaseNode<
  "OpenAIToChatEvent",
  { responseData: TypedSocket },
  { event: TypedSocket },
  object
> {
  constructor() {
    super("OpenAIToChatEvent");
    this.addInputPort([
      {
        key: "responseData",
        typeName: "OpenAIClientResponseOrNull",
        label: "Response Data",
      },
    ]);
    this.addOutputPort([
      { key: "event", typeName: "ChatCommandEventOrNull", label: "Event" },
    ]);
  }

  // データ変換
  data(inputs: { responseData?: OpenAIClientResponseOrNull[] }): {
    event?: ChatCommandEventOrNull;
  } {
    const response = inputs.responseData?.[0] || null;
    if (!response) return { event: null };

    let event: ChatCommandEvent | undefined;
    if ("type" in response) {
      switch (response.type) {
        case "response.created":
          event = {
            type: "start",
            message: {
              model: response.response.model,
              created_at: response.response.created_at,
            },
          };
          break;
        case "response.output_item.added":
          if (response.item.type === "message") {
            event = {
              type: "setInfo",
              message: {
                id: response.item.id,
              } as ChatMessageItem,
            };
          }
          break;
        case "response.output_text.delta":
          event = { type: "delta", delta: response.delta };
          break;
        case "response.output_text.done":
          event = { type: "done", text: response.text };
          break;
        case "error":
        case "response.failed":
          event = { type: "error" };
          break;
        default:
          break;
      }
    } else {
      const msgs: ChatMessageItem[] = [];
      for (const item of response.output) {
        if (item.type === "message") {
          msgs.push({
            id: item.id,
            role: item.role,
            type: "message",
            content: item.content,
            model: response.model,
            status: item.status,
            created_at: response.created_at,
            tokensCount: response.usage?.output_tokens,
          });
        }
      }
      event = { type: "response", messages: msgs };
    }
    return { event };
  }

  execute(): void {}
}
