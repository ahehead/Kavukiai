import type { PromptRecipe } from "@nodes/ComfyUI/common/schema/prompt.schema";

export * from "@nodes/ComfyUI/common/schema/prompt.schema";
export { WorkflowRef } from "@nodes/ComfyUI/common/schema/workflow-ref.schema";
export * from "./launch";
export * from "./port-events";

export type ComfyUIRunRequestArgs = {
  id: string;
  recipe: PromptRecipe;
};
