import { registerLMStudioChatHandler } from "./chat";
import { registerLMStudioLoadModelHandler } from "./loadModel";
import { registerLMStudioServerHandlers } from "./server";

export const register = (): void => {
  registerLMStudioServerHandlers();
  registerLMStudioLoadModelHandler();
  registerLMStudioChatHandler();
};
