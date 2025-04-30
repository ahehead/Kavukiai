export enum IpcChannel {
  LoadState = "load-state",
  SaveApiKey = "save-api-key",
  OpenAIRequest = "openai-request",
  OpenSettings = "open-settings",
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
