import { registerSnapshotHandlers } from "./snapshot";
import { registerOpenAIHandlers } from "./openai";
import { registerSaveHandlers } from "./save";
import { registerCloseConfirmHandler } from "./close-confirm";
import { registerLoadFileHandler } from "./load-file";
import { registerApiKeysHandlers } from "./apikeys";
import { registerLMStudioHandlers } from "./lmstudio";
// import { registerOtherServiceHandlers } from "./otherService";

export function registerIpcHandlers(): void {
  registerSnapshotHandlers();
  registerOpenAIHandlers();
  registerSaveHandlers();
  registerCloseConfirmHandler();
  registerLoadFileHandler();
  registerApiKeysHandlers();
  registerLMStudioHandlers();
  // registerOtherServiceHandlers();
}
