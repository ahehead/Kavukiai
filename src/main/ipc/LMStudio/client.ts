import {
  type BaseLoadModelOpts,
  type LLM,
  type LLMLoadModelConfig,
  LMStudioClient,
} from "@lmstudio/sdk";

let client: LMStudioClient | null = null;

/**
 * Retrieves the list of currently loaded models.
 */
export async function listLoadedModels(): Promise<LLM[]> {
  return getLMStudioClient().llm.listLoaded();
}

/**
 * Finds a loaded model by its key.
 */
export async function findLoadedModel(
  modelKey: string
): Promise<LLM | undefined> {
  const models = await listLoadedModels();
  return models.find((m) => m.modelKey === modelKey);
}

/**
 * Returns a singleton LMStudioClient instance.
 */
export function getLMStudioClient(): LMStudioClient {
  if (!client) {
    client = new LMStudioClient();
  }
  return client;
}

/**
 * Loads the model if not already loaded, otherwise returns existing model info.
 */
export async function getLoadedModel(
  modelKey: string,
  loadOption?: BaseLoadModelOpts<LLMLoadModelConfig>
): Promise<LLM> {
  const lmStudioClient = getLMStudioClient();
  const existing = await findLoadedModel(modelKey);
  if (!existing) {
    return lmStudioClient.llm.load(modelKey, loadOption);
  }
  return existing;
}

/**
 * Unloads a specific model by its key.
 */
export async function unload(modelKey: string): Promise<void> {
  const model = await findLoadedModel(modelKey);
  if (!model) {
    throw new Error(`Model ${modelKey} is not loaded.`);
  }
  await getLMStudioClient().llm.unload(model.identifier);
}

/**
 * Unloads all currently loaded models.
 */
export async function unloadAllModels(): Promise<void> {
  const lmStudioClient = getLMStudioClient();
  const models = await listLoadedModels();
  await Promise.all(models.map((m) => lmStudioClient.llm.unload(m.identifier)));
}
