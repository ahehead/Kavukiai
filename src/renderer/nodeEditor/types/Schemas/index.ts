import { type Static, type TSchema, Type } from "@sinclair/typebox";
import * as DefaultSchema from "./DefaultSchema";
import * as ModelInfoSchemas from "./lmstudio/ModelSchemas";
import * as BaseSchemas from "./openai/BaseSchemas";
import { Timestamp } from "./openai/BaseSchemas";
import * as EventsSchemas from "./openai/EventsSchemas";
import { ResponseStreamEvent } from "./openai/EventsSchemas";
import * as InputSchemas from "./openai/InputSchemas";
import {
  type ResponseInput,
  ResponseInputMessageItem,
} from "./openai/InputSchemas";
import * as RequestSchemas from "./openai/RequestSchemas";
import * as ResponseSchemas from "./openai/ResponseSchemas";

export const Image = Type.Object({
  url: Type.String({ description: "image url" }),
  alt: Type.Optional(Type.String({ description: "alt text" })),
});
export type Image = Static<typeof Image>;

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
      tokensCount: Type.Optional(Type.Number()),
      tokensPerSecond: Type.Optional(Type.Number()),
    }),
  ],
  { description: "A chat message item with extra metadata" }
);
export type ChatMessageItem = Static<typeof ChatMessageItem>;

export function chatMessagesToResponseInput(
  messages: ChatMessageItem[]
): ResponseInput {
  return messages.map(
    ({ model, created_at, tokensCount, tokensPerSecond, ...rest }) => rest
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

  Image,

  ...ModelInfoSchemas,
} satisfies Record<string, TSchema>;

export type SchemaKey = keyof typeof registry;

export function getSchema<K extends SchemaKey>(type: K) {
  return registry[type];
}
