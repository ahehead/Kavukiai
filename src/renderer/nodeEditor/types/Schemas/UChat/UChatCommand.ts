import type { Static } from "@sinclair/typebox";
import { Type } from "@sinclair/typebox";
import { UChatMessage } from "./UChatMessage";

// OpenAIのレスポンスをChatCommandEventに変換するためのイベント型
export const UChatCommandEvent = Type.Union([
  Type.Object({
    type: Type.Literal("start"),
    message: Type.Optional(UChatMessage),
  }),
  Type.Object({
    type: Type.Literal("setInfo"),
    message: Type.Partial(UChatMessage),
  }),
  Type.Object({
    type: Type.Literal("delta"),
    delta: Type.String(),
  }),
  Type.Object({
    type: Type.Literal("finish"),
    text: Type.String(),
    message: Type.Optional(Type.Partial(UChatMessage)),
  }),
  Type.Object({
    type: Type.Literal("error"),
    message: Type.Optional(Type.String()),
  }),
  Type.Object({
    type: Type.Literal("response"),
    messages: Type.Array(UChatMessage),
  }),
]);

export type UChatCommandEvent = Static<typeof UChatCommandEvent>;

export const UChatCommandEventOrNull = Type.Union([
  UChatCommandEvent,
  Type.Null(),
]);

export type UChatCommandEventOrNull = Static<typeof UChatCommandEventOrNull>;
