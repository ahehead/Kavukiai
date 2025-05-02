import { registerSnapshotHandlers } from "./snapshot";
import { registerOpenAIHandlers } from "./openai";
import { registerSaveHandlers } from "./save";
// import { registerOtherServiceHandlers } from "./otherService";

export function registerIpcHandlers(): void {
  registerSnapshotHandlers();
  registerOpenAIHandlers();
  registerSaveHandlers();
  // registerOtherServiceHandlers();
}
