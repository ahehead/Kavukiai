import type { LMStudioChatPortEventOrNull } from "@nodes/LMStudio/common/schema/LMStudioChatPortEventOrNull";
import {
  SerializableInputsNode,
  type TypedSocket,
} from "renderer/nodeEditor/types";
import type {
  UChatCommandEvent,
  UChatCommandEventOrNull,
} from "@nodes/Chat/common/schema/UChatCommand";
import { createUChatMessageFromLMStudioFinishEvent } from "@nodes/Chat/common/schema/UChatMessage";

// LMStudioChatPortEventOrNull を UChatCommandEvent に変換
export class LMStudioToUChatCommandNode extends SerializableInputsNode<
  "LMStudioToUChatCommand",
  { event: TypedSocket },
  { command: TypedSocket },
  object
> {
  constructor() {
    super("LMStudioToUChatCommand");
    this.addInputPort({
      key: "event",
      typeName: "LMStudioChatPortEventOrNull",
      label: "Event",
    });
    this.addOutputPort({
      key: "command",
      typeName: "UChatCommandEventOrNull",
      label: "Command",
    });
  }

  data(inputs: { event?: LMStudioChatPortEventOrNull[] }): {
    command?: UChatCommandEventOrNull;
  } {
    const event = inputs.event?.[0];
    if (!event) return { command: null };

    let command: UChatCommandEvent;

    switch (event.type) {
      case "start":
        command = {
          type: "start",
        };
        break;
      case "error":
        command = {
          type: "error",
          message: event.message,
        };
        break;

      case "stream":
        command = {
          type: "delta",
          delta: event.delta,
        };
        break;

      case "finish": {
        // LMStudioの完了イベントをUChatCommandEventに変換（共通関数へ委譲）
        command = {
          type: "finish",
          text: event.result.content,
          message: createUChatMessageFromLMStudioFinishEvent(event),
        };
        break;
      }

      default: {
        // 予期しないイベントタイプの場合はエラーとして扱う
        command = {
          type: "error",
          message: `Unknown event type: ${(event as any).type}`,
        };
        break;
      }
    }

    return { command };
  }
}

