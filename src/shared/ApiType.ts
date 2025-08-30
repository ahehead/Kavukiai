import type OpenAI from "openai";
import type { ResponseStreamEvent } from "renderer/nodeEditor/types/Schemas/openai/EventsSchemas";
import type { Response } from "renderer/nodeEditor/types/Schemas/openai/ResponseSchemas";
import type { GraphJsonData } from "./JsonType";

export type SaveJsonOptions = {
  /** 既存ファイルがある場合はエラーにする */
  disallowOverwrite?: boolean;
  /** このパスと同一の保存先を禁止（例: Save Asで元パスの指定禁止） */
  forbidSamePath?: string;
};

export enum IpcChannel {
  LoadSnapshot = "load-snapshot",
  SaveSnapshot = "save-snapshot",

  SaveApiKey = "save-api-key",
  LoadApiKeys = "load-api-keys",
  OpenAIRequest = "openai-request",

  OpenSettings = "open-settings",

  SaveGraphInitiate = "save-graph-initiate",
  SaveAsGraphInitiate = "save-as-graph-initiate",
  ShowSaveDialog = "show-save-dialog",
  ShowOpenPathDialog = "show-open-path-dialog",
  SaveJsonGraph = "save-json-graph",
  ShowCloseConfirm = "show-close-confirm",

  FileLoadedRequest = "file-loaded-request",
  LoadFile = "load-file",
  ReadJsonByPath = "read-json-by-path",

  PortChatGpt = "port-chat-gpt",

  ListLMStudioModels = "list-lmstudio-models",
  StartLMStudioServer = "start-lmstudio-server",
  StopLMStudioServer = "stop-lmstudio-server",
  GetLMStudioStatus = "get-lmstudio-status",
  PortLMStudioLoadModel = "port-lmstudio-load-model",
  UnloadLMStudioModels = "unload-lmstudio-models",
  LMStudioChatRequest = "lmstudio-chat-request",
  PortLMStudioChat = "port-lmstudio-chat",
  // ComfyUI
  PortComfyUIRunRecipe = "port-comfyui-run-recipe",
  ListComfyUserWorkflows = "list-comfy-user-workflows",
  ListComfyTemplateWorkflows = "list-comfy-template-workflows",
  LaunchComfyDesktop = "launch-comfy-desktop",
  ReadWorkflowRef = "read-workflow-ref",
  ComfyUIFreeMemory = "comfyui-free-memory",
}

// 汎用パス選択ダイアログ
export type FileFilter = { name: string; extensions: string[] };
export type OpenPathDialogOptions = {
  /** ファイル選択/フォルダ選択/両方 */
  mode: "file" | "folder" | "both";
  /** ダイアログタイトル */
  title?: string;
  /** 既定のパス */
  defaultPath?: string;
  /** ファイルフィルタ（mode が file/both の場合のみ有効） */
  filters?: FileFilter[];
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
