import { type Static, Type, type TSchema } from "@sinclair/typebox";

import * as InputSchemas from "./openai/InputSchemas";
import * as RequestSchemas from "./openai/RequestSchemas";
import * as ResponseSchemas from "./openai/ResponseSchemas";
import {
  type ResponseInput,
  ResponseInputMessageItem,
} from "./openai/InputSchemas";
import { ResponseStreamEvent } from "./openai/EventsSchemas";
import { Timestamp } from "./openai/BaseSchemas";
import * as BaseSchemas from "./openai/BaseSchemas";
import * as DefaultSchema from "./DefaultSchema";
import * as EventsSchemas from "./openai/EventsSchemas";
import * as ModelInfoSchemas from "./lmstudio/ModelSchemas";

// OpenAIのclientからのレスポンスを表す型
export const OpenAIClientResponse = Type.Union([
  ResponseSchemas.Response,
  ResponseStreamEvent,
]);

export type OpenAIClientResponse = Static<typeof OpenAIClientResponse>;

export const OpenAIClientResponseOrNull = Type.Union([
  OpenAIClientResponse,
  Type.Null(),
]);

export type OpenAIClientResponseOrNull = Static<
  typeof OpenAIClientResponseOrNull
>;

// chat用type
export const ChatMessageItem = Type.Intersect(
  [
    ResponseInputMessageItem,
    Type.Object({
      model: Type.Optional(Type.String()),
      created_at: Type.Optional(Timestamp),
      tokens: Type.Optional(Type.Number()),
      token_speed: Type.Optional(Type.Number()),
    }),
  ],
  { description: "A chat message item with extra metadata" }
);
export type ChatMessageItem = Static<typeof ChatMessageItem>;

export function chatMessagesToResponseInput(
  messages: ChatMessageItem[]
): ResponseInput {
  return messages.map(
    ({ model, created_at, tokens, token_speed, ...rest }) => rest
  );
}

const registry = {
  ...BaseSchemas,
  ...DefaultSchema.defaultNodeSchemas,
  ...InputSchemas,
  ...RequestSchemas,
  ...ResponseSchemas,
  ...EventsSchemas,
  OpenAIClientResponse,
  OpenAIClientResponseOrNull,
  ChatMessageItem,

  ...ModelInfoSchemas,
} satisfies Record<string, TSchema>;

export type SchemaKey = keyof typeof registry;

export function getSchema<K extends SchemaKey>(type: K) {
  return registry[type];
}
