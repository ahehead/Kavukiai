import { ResponseStreamEvent } from "@nodes/OpenAI/common/schema/EventsSchemas";
import * as ResponseSchemas from "@nodes/OpenAI/common/schema/ResponseSchemas";
import { type Static, Type } from "@sinclair/typebox";

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
