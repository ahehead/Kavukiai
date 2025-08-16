import { type Static, Type } from "@sinclair/typebox";
import { ResponseStreamEvent } from "./openai/EventsSchemas";
import * as ResponseSchemas from "./openai/ResponseSchemas";

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
