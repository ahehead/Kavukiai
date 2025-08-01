import type { Static } from "@sinclair/typebox";
import { Type } from "@sinclair/typebox";
import { ChatMessageItem } from "./ChatMessageItem";

// OpenAIのレスポンスをChatCommandEventに変換するためのイベント型
export const ChatCommandEvent = Type.Union([
  Type.Object({
    type: Type.Literal("start"),
    message: Type.Object({
      model: Type.String(),
      created_at: Type.Number(),
    }),
  }),
  Type.Object({
    type: Type.Literal("setInfo"),
    message: ChatMessageItem,
  }),
  Type.Object({
    type: Type.Literal("delta"),
    delta: Type.String(),
  }),
  Type.Object({
    type: Type.Literal("done"),
    text: Type.String(),
  }),
  Type.Object({
    type: Type.Literal("error"),
    message: Type.Optional(Type.String()),
  }),
  Type.Object({
    type: Type.Literal("response"),
    messages: Type.Array(ChatMessageItem),
  }),
]);

export type ChatCommandEvent = Static<typeof ChatCommandEvent>;

export const ChatCommandEventOrNull = Type.Union([
  ChatCommandEvent,
  Type.Null(),
]);

export type ChatCommandEventOrNull = Static<typeof ChatCommandEventOrNull>;
