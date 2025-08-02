import type { TSchema } from "@sinclair/typebox";
import { ChatCommandEvent, ChatCommandEventOrNull } from "./ChatCommandEvent";
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
  UChatCommandEvent,
  UChatCommandEventOrNull,
} from "./UChat/UChatCommand";
import {
  UChat,
  UChatMessage,
  UChatRole,
  UFileRef,
  UPart,
} from "./UChat/UChatMessage";
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
  UChatRole,
  UFileRef,
  UPart,
  UChatMessage,
  UChat,
  UChatCommandEvent,
  UChatCommandEventOrNull,

  ...ModelInfoSchemas,
  ...StatusSchemas,
  ChatCommandEvent,
  ChatCommandEventOrNull,
} satisfies Record<string, TSchema>;

export type SchemaKey = keyof typeof registry;

export function getSchema<K extends SchemaKey>(type: K) {
  return registry[type];
}
