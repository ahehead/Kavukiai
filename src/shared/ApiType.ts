import type OpenAI from "openai";
import type { ResponseStreamEvent } from "renderer/nodeEditor/types/Schemas/openai/EventsSchemas";
import type { Response } from "renderer/nodeEditor/types/Schemas/openai/ResponseSchemas";
import type { GraphJsonData } from "./JsonType";

export enum IpcChannel {
  LoadSnapshot = "load-snapshot",
  SaveSnapshot = "save-snapshot",

  SaveApiKey = "save-api-key",
  LoadApiKeys = "load-api-keys",
  OpenAIRequest = "openai-request",

  OpenSettings = "open-settings",

  SaveGraphInitiate = "save-graph-initiate",
  ShowSaveDialog = "show-save-dialog",
  SaveJsonGraph = "save-json-graph",
  ShowCloseConfirm = "show-close-confirm",

  FileLoadedRequest = "file-loaded-request",
  LoadFile = "load-file",

  PortChatGpt = "port-chat-gpt",

  ListLMStudioModels = "list-lmstudio-models",
  StartLMStudioServer = "start-lmstudio-server",
  StopLMStudioServer = "stop-lmstudio-server",
  GetLMStudioStatus = "get-lmstudio-status",
  PortLMStudioLoadModel = "port-lmstudio-load-model",
  UnloadLMStudioModels = "unload-lmstudio-models",
  LMStudioChatRequest = "lmstudio-chat-request",
  PortLMStudioChat = "port-lmstudio-chat",
}

// ファイルを閉じる確認dialogの返答
export enum CloseFileDialogResponse {
  Confirm = 0,
  DoNotSave = 1,
  Cancel = 2,
}

// apiでやり取りするFile情報
export type FileData = {
  filePath: string;
  fileName: string;
  json: GraphJsonData;
};

export type OpenAIRequestArgs = {
  id: string;
  param: OpenAI.Responses.ResponseCreateParams;
};

export type IpcResult<T> =
  | { status: "success"; data: T }
  | { status: "error"; message: string; code?: string };

export type IpcResultDialog<T> =
  | { status: "success"; data: T }
  | { status: "cancel" }
  | { status: "error"; message: string; code?: string };

export type OpenAIPortEventType =
  | { type: "abort" }
  | { type: "openai"; data: ResponseStreamEvent | Response }
  | { type: "error"; message: string };
