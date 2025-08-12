import type { PromptRecipe } from "../../renderer/nodeEditor/types/Schemas/comfyui/prompt.schema";

export * from "../../renderer/nodeEditor/types/Schemas/comfyui/prompt.schema";
export * from "./launch";
export * from "./port-events";

export type ComfyUIRunRequestArgs = {
  id: string;
  recipe: PromptRecipe;
};
