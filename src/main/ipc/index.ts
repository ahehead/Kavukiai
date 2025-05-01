import { registerStateHandlers } from "./state";
import { registerOpenAIHandlers } from "./openai";
import { registerGraphHandlers } from "./graph";
// import { registerOtherServiceHandlers } from "./otherService";

export function registerIpcHandlers(): void {
  registerStateHandlers();
  registerOpenAIHandlers();
  registerGraphHandlers();
  // registerOtherServiceHandlers();
}
