import { type Static, Type, type TSchema } from "@sinclair/typebox";
import * as BaseSchemas from "../Schemas/BaseSchemas";
import * as DefaultSchema from "../Schemas/DefaultSchema";
import * as InputSchemas from "../Schemas/InputSchemas";
import * as RequestSchemas from "../Schemas/RequestSchemas";
import * as ResponseSchemas from "../Schemas/ResponseSchemas";
import * as EventsSchemas from "../Schemas/EventsSchemas";
import { ResponseInputMessageItem } from "../Schemas/InputSchemas";
import { ResponseStreamEvent } from "../Schemas/EventsSchemas";
import * as Base from "../Schemas/BaseSchemas";

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
      created_at: Type.Optional(Base.Timestamp),
      tokens: Type.Optional(Type.Number()),
      token_speed: Type.Optional(Type.Number()),
    }),
  ],
  { description: "A chat message item with extra metadata" }
);
export type ChatMessageItem = Static<typeof ChatMessageItem>;

export function chatMessagesToResponseInput(
  messages: ChatMessageItem[]
): ResponseInputMessageItem[] {
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
} satisfies Record<string, TSchema>;

export type SchemaKey = keyof typeof registry;

export function getSchema<K extends SchemaKey>(type: K) {
  return registry[type];
}
