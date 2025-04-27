import { registerStateHandlers } from "./state";
import { registerOpenAIHandlers } from "./openai";
// import { registerOtherServiceHandlers } from "./otherService";

export function registerIpcHandlers(): void {
  registerStateHandlers();
  registerOpenAIHandlers();
  // registerOtherServiceHandlers();
}
