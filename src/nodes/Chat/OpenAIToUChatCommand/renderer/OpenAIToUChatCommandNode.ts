import {
  SerializableInputsNode,
  type TypedSocket,
} from "renderer/nodeEditor/types";
import type {
  UChatCommandEvent,
  UChatCommandEventOrNull,
} from "@nodes/Chat/common/schema/UChatCommand";
import type {
  UChatMessage,
  UPart,
} from "@nodes/Chat/common/schema/UChatMessage";
import type { OpenAIClientResponseOrNull } from "renderer/nodeEditor/types/Schemas/Util";

// OpenAIClientResponseOrNull を UChatCommandEvent に変換
export class OpenAIToUChatCommandNode extends SerializableInputsNode<
  "OpenAIToUChatCommand",
  { response: TypedSocket },
  { event: TypedSocket },
  object
> {
  constructor() {
    super("OpenAIToUChatCommand");
    this.addInputPort({
      key: "response",
      typeName: "OpenAIClientResponseOrNull",
      label: "Response",
    });
    this.addOutputPort({
      key: "event",
      typeName: "UChatCommandEventOrNull",
      label: "Event",
    });
  }

  data(inputs: { response?: OpenAIClientResponseOrNull[] }): {
    event?: UChatCommandEventOrNull;
  } {
    const response = inputs.response?.[0];
    if (!response) return { event: null };

    let event: UChatCommandEvent | undefined;
    if ("type" in response) {
      switch (response.type) {
        case "response.created":
          event = {
            type: "start",
            message: {
              model: response.response.model,
              created_at: response.response.created_at,
              role: "assistant",
              content: [],
            } as UChatMessage,
          };
          break;
        case "response.output_item.added":
          if (response.item.type === "message") {
            event = {
              type: "setInfo",
              message: {
                role: response.item.role,
                content: [],
              },
            } as UChatCommandEvent;
          }
          break;
        case "response.output_text.delta":
          event = { type: "delta", delta: response.delta };
          break;
        case "response.output_text.done":
          event = { type: "finish", text: response.text };
          break;
        case "error":
        case "response.failed":
          event = { type: "error" };
          break;
      }
    } else {
      const messages: UChatMessage[] = [];
      for (const item of response.output) {
        if (item.type === "message") {
          const parts: UPart[] = [];
          for (const c of item.content) {
            if (c.type === "output_text") {
              parts.push({ type: "text", text: c.text });
            }
          }
          messages.push({
            role: item.role as any,
            type: "message",
            content: parts,
            model: response.model,
            created_at: response.created_at,
            tokensCount: response.usage?.output_tokens,
          } as UChatMessage);
        }
      }
      event = { type: "response", messages };
    }
    return { event };
  }
}

