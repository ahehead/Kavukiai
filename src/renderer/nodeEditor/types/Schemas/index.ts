import type { TSchema } from "@sinclair/typebox";
import * as BaseSchemas from "../Schemas/BaseSchemas";
import * as DefaultSchema from "../Schemas/DefaultSchema";
import * as InputSchemas from "../Schemas/InputSchemas";
import * as RequestSchemas from "../Schemas/RequestSchemas";
import * as ResponseSchemas from "../Schemas/ResponseSchemas";
import * as EventsSchemas from "../Schemas/EventsSchemas";
import type {
  ChatMessageItem,
  ResponseInputMessageItem,
} from "../Schemas/InputSchemas";

const registry: Record<string, TSchema> = {
  ...BaseSchemas,
  ...DefaultSchema.defaultNodeSchemas,
  ...InputSchemas,
  ...RequestSchemas,
  ...ResponseSchemas,
  ...EventsSchemas,
} as const;

export type SchemaKey = keyof typeof registry;

export function getSchema<K extends SchemaKey>(type: K) {
  return registry[type];
}

export function chatMessagesToResponseInput(
  messages: ChatMessageItem[]
): ResponseInputMessageItem[] {
  return messages.map(
    ({ model, created_at, tokens, token_speed, ...rest }) => rest
  );
}
