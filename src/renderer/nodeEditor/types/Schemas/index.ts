import type { TSchema } from "@sinclair/typebox";
import * as PromptRecipe from "shared/ComfyUIType";
import * as DefaultSchema from "./DefaultSchema";
import { LMStudioChatPortEventOrNull } from "./LMStudioChatPortEventOrNull";
import {
  ChatHistoryData,
  LLMPredictionConfig,
} from "./lmstudio/LMStudioSchemas";
import * as ModelInfoSchemas from "./lmstudio/ModelSchemas";
import * as StatusSchemas from "./lmstudio/StatusSchemas";
import {
  ImageArrayOrNull,
  NodeImage,
  NodeImageArray,
  NodeImageOrArray,
  NodeImageOrArrayOrNull,
} from "./NodeImage";
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
  UPartArray,
} from "./UChat/UChatMessage";
import { OpenAIClientResponse, OpenAIClientResponseOrNull } from "./Util";

const registry = {
  ...BaseSchemas,
  ...DefaultSchema.defaultNodeSchemas,
  ...InputSchemas,
  ...RequestSchemas,
  ...ResponseSchemas,
  ...EventsSchemas,
  OpenAIClientResponse,
  OpenAIClientResponseOrNull,
  UChatRole,
  UFileRef,
  UPart,
  UPartArray,
  UChatMessage,
  UChat,
  UChatCommandEvent,
  UChatCommandEventOrNull,
  ChatHistoryData,
  ...ModelInfoSchemas,
  ...StatusSchemas,
  LMStudioChatPortEventOrNull,
  NodeImage,
  NodeImageArray,
  NodeImageOrArray,
  ImageArrayOrNull,
  NodeImageOrArrayOrNull,
  ...PromptRecipe,
  LLMPredictionConfig,
} satisfies Record<string, TSchema>;

export type SchemaKey = keyof typeof registry;

export function getSchema<K extends SchemaKey>(type: K) {
  return registry[type];
}
