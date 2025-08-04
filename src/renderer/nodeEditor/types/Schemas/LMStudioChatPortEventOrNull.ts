import { type Static, Type } from "@sinclair/typebox";
import { LLMInstanceInfoSchema, LLMPredictionStatsSchema } from "./lmstudio";

/** main側のLMStudioとやり取りするためのイベント型 */
export const LMStudioChatPortEventSchema = Type.Union(
  [
    Type.Object(
      {
        type: Type.Literal("error"),
        message: Type.String({ description: "Error message" }),
      },
      { description: "Error event" }
    ),
    Type.Object(
      {
        type: Type.Literal("stream"),
        delta: Type.String({ description: "Stream delta content" }),
      },
      { description: "Streaming content event" }
    ),
    Type.Object(
      {
        type: Type.Literal("done"),
        result: Type.Object(
          {
            content: Type.String({ description: "Complete generated content" }),
            reasoningContent: Type.String({
              description: "Reasoning parts of generated content",
            }),
            status: LLMPredictionStatsSchema,
            modelInfo: LLMInstanceInfoSchema,
          },
          { description: "Chat completion result" }
        ),
      },
      { description: "Completion event with result" }
    ),
  ],
  { description: "LMStudio chat port event types" }
);

export const LMStudioChatPortEventOrNull = Type.Union(
  [LMStudioChatPortEventSchema, Type.Null()],
  { description: "LMStudio chat port event or null" }
);

export type LMStudioChatPortEventOrNull = Static<
  typeof LMStudioChatPortEventOrNull
>;
export type LMStudioChatPortEvent = Static<typeof LMStudioChatPortEventSchema>;
