import type { GraphJsonData } from "./JsonType";

export enum IpcChannel {
  LoadSnapshot = "load-snapshot",
  SaveSnapshot = "save-snapshot",

  SaveApiKey = "save-api-key",
  OpenAIRequest = "openai-request",

  OpenSettings = "open-settings",

  SaveGraphInitiate = "save-graph-initiate",
  ShowSaveDialog = "show-save-dialog",
  SaveJsonGraph = "save-json-graph",
  ShowCloseConfirm = "show-close-confirm",

  FileLoadedRequest = "file-loaded-request",
  LoadFile = "load-file",
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
