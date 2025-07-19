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
  PortLMStudioLoadModel = "port-lmstudio-load-model",
}

export type OpenAIParams = any;

export type OpenAIResponse = {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

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

export type LMStudioLoadRequestArgs = {
  id: string;
  modelKey: string;
};

export type LMStudioPortEvent =
  | { type: "start" }
  | { type: "progress"; progress: number }
  | { type: "done" }
  | { type: "error"; message: string }
  | { type: "abort" };

export type IpcResult<T> =
  | { status: "success"; data: T }
  | { status: "error"; message: string; code?: string };

export type IpcResultDialog<T> =
  | { status: "success"; data: T }
  | { status: "cancel" }
  | { status: "error"; message: string; code?: string };

export type PortEventType =
  | { type: "error"; message: string }
  | { type: "abort" }
  | { type: "openai"; data: ResponseStreamEvent | Response };
