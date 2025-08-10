import type {
  ChatHistoryData,
  LLMPredictionConfig,
} from "renderer/nodeEditor/types/Schemas/lmstudio/LMStudioSchemas";

export type LMStudioLoadRequestArgs = {
  id: string;
  modelKey: string;
};

export type LMStudioPortEvent =
  | { type: "start" }
  | { type: "progress"; progress: number }
  | { type: "finish" }
  | { type: "error"; message: string }
  | { type: "abort" };

export type LMStudioChatRequestArgs = {
  id: string;
  modelKey?: string;
  chatHistoryData: ChatHistoryData;
  config?: LLMPredictionConfig;
};

export type LMStudioStatusInfo = {
  server: "ON" | "OFF";
  port?: number;
  loadedModels: string[];
};
export type { LMStudioChatPortEvent } from "renderer/nodeEditor/types/Schemas/LMStudioChatPortEventOrNull";
