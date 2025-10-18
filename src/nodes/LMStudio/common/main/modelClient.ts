import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  type BaseLoadModelOpts,
  type LLM,
  type LLMLoadModelConfig,
  LMStudioClient,
} from "@lmstudio/sdk";

const execFileAsync = promisify(execFile);

/**
 * Checks if LMStudio server is running via CLI.
 */
async function isServerRunningViaCli(): Promise<boolean> {
  try {
    const { stdout, stderr } = await execFileAsync("lms", ["status"], {
      encoding: "utf8",
    });
    // CLI may output status to stderr or stdout
    const output = stderr || stdout;
    return !output.includes("Server:  OFF");
  } catch {
    return false;
  }
}

let client: LMStudioClient | null = null;

/**
 * Returns a singleton LMStudioClient instance after ensuring the server is running.
 */
export async function getLMStudioClient(): Promise<LMStudioClient> {
  // Check server status before instantiating client
  const running = await isServerRunningViaCli();
  if (!running) {
    throw new Error(
      "LMStudio server is not running. Please start it via 'lms server start'."
    );
  }
  if (!client) {
    client = new LMStudioClient();
  }
  return client;
}

/**
 * Retrieves the list of currently loaded models.
 */
export async function listLoadedModels(): Promise<LLM[]> {
  const lmStudioClient = await getLMStudioClient();
  return lmStudioClient.llm.listLoaded();
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
 * Loads the model if not already loaded, otherwise returns existing model info.
 */
export async function getLoadedModel(
  modelKey: string,
  loadOption?: BaseLoadModelOpts<LLMLoadModelConfig>
): Promise<LLM> {
  const lmStudioClient = await getLMStudioClient();
  const existing = await findLoadedModel(modelKey);
  if (!existing) {
    return lmStudioClient.llm.load(modelKey, loadOption);
  }
  return existing;
}

/**
 * Unloads a specific model by its key.
 */
export async function unloadModel(modelKey: string): Promise<void> {
  const model = await findLoadedModel(modelKey);
  if (!model) {
    throw new Error(`Model ${modelKey} is not loaded.`);
  }
  const lmStudioClient = await getLMStudioClient();
  await lmStudioClient.llm.unload(model.identifier);
}

/**
 * Unloads all currently loaded models.
 */
export async function unloadAllModels(): Promise<void> {
  const lmStudioClient = await getLMStudioClient();
  const models = await listLoadedModels();
  await Promise.all(models.map((m) => lmStudioClient.llm.unload(m.identifier)));
}
