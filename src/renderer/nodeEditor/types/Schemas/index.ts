import type { TSchema } from "@sinclair/typebox";
import { ChatMessageItem, ChatMessageItemList } from "./ChatMessageItem";
import * as DefaultSchema from "./DefaultSchema";
import * as ModelInfoSchemas from "./lmstudio/ModelSchemas";
import * as StatusSchemas from "./lmstudio/StatusSchemas";
import * as BaseSchemas from "./openai/BaseSchemas";

import * as EventsSchemas from "./openai/EventsSchemas";
import * as InputSchemas from "./openai/InputSchemas";

import * as RequestSchemas from "./openai/RequestSchemas";
import * as ResponseSchemas from "./openai/ResponseSchemas";
import {
  Image,
  OpenAIClientResponse,
  OpenAIClientResponseOrNull,
} from "./Util";

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
  ChatMessageItemList,
  Image,

  ...ModelInfoSchemas,
  ...StatusSchemas,
} satisfies Record<string, TSchema>;

export type SchemaKey = keyof typeof registry;

export function getSchema<K extends SchemaKey>(type: K) {
  return registry[type];
}
