import { type Static, Type } from "@sinclair/typebox";
import { Timestamp } from "./openai/BaseSchemas";
import type { ResponseInput } from "./openai/InputSchemas";
import { ResponseInputMessageItem } from "./openai/InputSchemas";
// chat用type
export const ChatMessageItem = Type.Intersect(
  [
    ResponseInputMessageItem,
    Type.Object({
      model: Type.Optional(Type.String()),
      created_at: Type.Optional(Timestamp),
      tokensCount: Type.Optional(Type.Number()),
      tokensPerSecond: Type.Optional(Type.Number()),
    }),
  ],
  { description: "A chat message item with extra metadata" }
);

export type ChatMessageItem = Static<typeof ChatMessageItem>;

export const ChatMessageItemList = Type.Array(ChatMessageItem);
export type ChatMessageItemList = Static<typeof ChatMessageItemList>;

export function chatMessagesToResponseInput(
  messages: ChatMessageItem[]
): ResponseInput {
  return messages.map(
    ({ model, created_at, tokensCount, tokensPerSecond, ...rest }) => rest
  );
}
