import { LMStudioChatPortEventOrNull } from "@nodes/LMStudio/common/schema/LMStudioChatPortEventOrNull";
import {
  ChatHistoryData,
  LLMPredictionConfig,
} from "@nodes/LMStudio/common/schema/LMStudioSchemas";
import * as ModelInfoSchemas from "@nodes/LMStudio/common/schema/ModelSchemas";
import * as StatusSchemas from "@nodes/LMStudio/common/schema/StatusSchemas";
import type { TSchema } from "@sinclair/typebox";
import * as PromptRecipe from "@nodes/ComfyUI/common/shared";
import * as DefaultSchema from "./DefaultSchema";
import {
  ImageArrayOrNull,
  NodeImage,
  NodeImageArray,
  NodeImageOrArray,
  NodeImageOrArrayOrNull,
} from "./NodeImage";
import * as BaseSchemas from "@nodes/OpenAI/common/schema/BaseSchemas";
import * as EventsSchemas from "@nodes/OpenAI/common/schema/EventsSchemas";
import * as InputSchemas from "@nodes/OpenAI/common/schema/InputSchemas";
import * as RequestSchemas from "@nodes/OpenAI/common/schema/RequestSchemas";
import * as ResponseSchemas from "@nodes/OpenAI/common/schema/ResponseSchemas";
import {
  UChatCommandEvent,
  UChatCommandEventOrNull,
} from "@nodes/Chat/common/schema/UChatCommand";
import {
  UChat,
  UChatMessage,
  UChatRole,
  UFileRef,
  UPart,
  UPartArray,
} from "@nodes/Chat/common/schema/UChatMessage";
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
