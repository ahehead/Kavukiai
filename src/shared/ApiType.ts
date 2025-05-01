export enum IpcChannel {
  LoadState = "load-state",
  SaveApiKey = "save-api-key",
  OpenAIRequest = "openai-request",
  OpenSettings = "open-settings",
  SaveState = "SaveState",
  SaveGraphInitiate = "save-graph-initiate",
  ShowSaveDialog = "show-save-dialog",
  SaveGraph = "save-graph",
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
