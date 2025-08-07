import { BaseNode, type TypedSocket } from "renderer/nodeEditor/types";
import type { LMStudioChatPortEventOrNull } from "renderer/nodeEditor/types/Schemas/LMStudioChatPortEventOrNull";
import type {
  UChatCommandEvent,
  UChatCommandEventOrNull,
} from "renderer/nodeEditor/types/Schemas/UChat/UChatCommand";
import type { UChatMessage } from "renderer/nodeEditor/types/Schemas/UChat/UChatMessage";

// LMStudioChatPortEventOrNull を UChatCommandEvent に変換
export class LMStudioToUChatCommandNode extends BaseNode<
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
        // LMStudioの完了イベントをUChatCommandEventに変換
        const message: UChatMessage = {
          role: "assistant",
          content: [{ type: "text", text: event.result.content }],
          model: event.result.modelInfo.modelKey,
          tokensCount: event.result.status.predictedTokensCount,
          tokensPerSecond: event.result.status.tokensPerSecond,
        };

        command = {
          type: "finish",
          text: event.result.content,
          message: message,
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

  execute(): void {}
}
