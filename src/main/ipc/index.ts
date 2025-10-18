import { loadModules } from "lib/loadModules";
import { registerApiKeysHandlers } from "./apikeys";
import { registerComfyUIFreeMemoryHandler } from "./ComfyUI/freeMemoryHandler";
import { registerLaunchComfyDesktopHandler } from "./ComfyUI/launchDesktopHandler";
import { registerComfyUICheckpointsHandler } from "./ComfyUI/listCheckpointsHandler";
import { registerComfyUIWorkflowListHandlers } from "./ComfyUI/listWorkflowsHandler";
import { registerReadWorkflowJsonHandler } from "./ComfyUI/readWorkflowJsonHandler";
import { registerReadWorkflowRefHandler } from "./ComfyUI/readWorkflowRefHandler";
import { registerComfyUIRunRecipeHandler } from "./ComfyUI/runRecipeHandler";
import { registerToApiPromptStrictHandler } from "./ComfyUI/toApiPromptStrictHandler";
import { registerCloseConfirmHandler } from "./close-confirm";
import { registerExportPngHandler } from "./export-png";
import { registerWriteTempFile } from "./filepath";
import { registerImportPngHandler } from "./import-png";
import { registerLoadFileHandler } from "./load-file";
import { registerOpenAIHandlers } from "./openai";
import { registerReadJsonByPathHandler } from "./read-json-by-path";
import { registerSaveHandlers } from "./save";
import { registerSnapshotHandlers } from "./snapshot";

// import { registerOtherServiceHandlers } from "./otherService";

type MainIpcModuleExports = {
  register?: () => void | Promise<void>;
  default?: () => void | Promise<void>;
};

const nodeIpcModules = import.meta.glob<MainIpcModuleExports>(
  "../../nodes/**/main/{register,ipc}.{ts,tsx,js}",
  {
    eager: true,
  }
);

const resolveModule = async (
  module: MainIpcModuleExports,
  path: string
): Promise<void> => {
  if (typeof module.register === "function") {
    await module.register();
    return;
  }

  const maybeDefault = module.default;
  if (typeof maybeDefault === "function") {
    await maybeDefault();
    return;
  }

  throw new Error(
    `No IPC register export found for module '${path}'. Expected a register() function or default export.`
  );
};

const registerLegacyHandlers = (): void => {
  registerSnapshotHandlers();
  registerOpenAIHandlers();
  registerSaveHandlers();
  registerCloseConfirmHandler();
  registerLoadFileHandler();
  registerApiKeysHandlers();
  registerComfyUIRunRecipeHandler();
  registerComfyUIWorkflowListHandlers();
  registerComfyUICheckpointsHandler();
  registerComfyUIFreeMemoryHandler();
  registerLaunchComfyDesktopHandler();
  registerReadJsonByPathHandler();
  registerReadWorkflowRefHandler();
  registerReadWorkflowJsonHandler();
  registerToApiPromptStrictHandler();
  registerExportPngHandler();
  registerImportPngHandler();
  registerWriteTempFile();
  // registerOtherServiceHandlers();
};

const registerNodeHandlers = async (): Promise<void> => {
  try {
    await loadModules(nodeIpcModules, {
      resolve: resolveModule,
    });
  } catch (error) {
    console.error("Failed to register node IPC handlers", error);
  }
};

export async function registerIpcHandlers(): Promise<void> {
  registerLegacyHandlers();
  await registerNodeHandlers();
}
