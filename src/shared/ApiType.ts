export enum IpcChannel {
  LoadSnapshot = "load-snapshot",
  SaveSnapshot = "save-snapshot",

  SaveApiKey = "save-api-key",
  OpenAIRequest = "openai-request",

  OpenSettings = "open-settings",

  SaveGraphInitiate = "save-graph-initiate",
  ShowSaveDialog = "show-save-dialog",
  SaveJsonGraph = "save-json-graph",
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
