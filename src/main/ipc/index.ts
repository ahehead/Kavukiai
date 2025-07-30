import { registerApiKeysHandlers } from "./apikeys";
import { registerCloseConfirmHandler } from "./close-confirm";
import { registerLMStudioChatHandler } from "./LMStudio/chatHandler";
import { registerLMStudioHandlers } from "./LMStudio/ipcHandlers";
import { registerLMStudioLoadModelHandler } from "./LMStudio/loadModelHandler";
import { registerLoadFileHandler } from "./load-file";
import { registerOpenAIHandlers } from "./openai";
import { registerSaveHandlers } from "./save";
import { registerSnapshotHandlers } from "./snapshot";
// import { registerOtherServiceHandlers } from "./otherService";

export function registerIpcHandlers(): void {
  registerSnapshotHandlers();
  registerOpenAIHandlers();
  registerSaveHandlers();
  registerCloseConfirmHandler();
  registerLoadFileHandler();
  registerApiKeysHandlers();
  registerLMStudioHandlers();
  registerLMStudioLoadModelHandler();
  registerLMStudioChatHandler();
  // registerOtherServiceHandlers();
}
