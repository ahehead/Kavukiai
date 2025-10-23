import { loadModules } from "lib/loadModules";
import { registerApiKeysHandlers } from "./apikeys";
import { registerCloseConfirmHandler } from "./close-confirm";
import { registerExportPngHandler } from "./export-png";
import { registerWriteTempFile } from "./filepath";
import { registerImportPngHandler } from "./import-png";
import { registerLoadFileHandler } from "./load-file";
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
  registerSaveHandlers();
  registerCloseConfirmHandler();
  registerLoadFileHandler();
  registerApiKeysHandlers();
  registerReadJsonByPathHandler();
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
