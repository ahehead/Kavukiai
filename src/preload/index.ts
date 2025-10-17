import { contextBridge } from "electron";
import { loadModules } from "lib/loadModules";
import { apiKeyApi } from "./apiKeys";
import { appStateApi } from "./appState";
import { comfyuiApi } from "./comfyui";
import { fileOperationsApi } from "./fileOperations";
import { openAIApi } from "./openAI";
import { settingsApi } from "./settings";

declare global {
  interface Window {
    App: typeof baseApi;
  }
}

type PreloadApiFactory = Record<string, unknown>;

type PreloadModuleExports = {
  register?: () => PreloadApiFactory;
  default?: PreloadApiFactory | (() => PreloadApiFactory);
  expose?: PreloadApiFactory;
};

const baseApi = {
  ...appStateApi,
  ...apiKeyApi,
  ...openAIApi,
  ...comfyuiApi,
  ...settingsApi,
  ...fileOperationsApi,
};

const preloadModules = import.meta.glob<PreloadModuleExports>(
  "../nodes/**/preload/api.{ts,tsx,js}",
  {
    eager: true,
  }
);

const resolveModule = (module: PreloadModuleExports, path: string) => {
  if (typeof module.register === "function") {
    return module.register();
  }

  const maybeDefault = module.default;
  if (typeof maybeDefault === "function") {
    return maybeDefault();
  }

  if (maybeDefault && typeof maybeDefault === "object") {
    return maybeDefault;
  }

  if (module.expose && typeof module.expose === "object") {
    return module.expose;
  }

  throw new Error(
    `No preload API export found for module '${path}'. Expected a register() function or default export.`
  );
};

const registerPreloadApis = async () => {
  try {
    const nodeApis = await loadModules(preloadModules, {
      resolve: resolveModule,
    });

    const mergedNodeApi = Object.assign({}, ...nodeApis);

    const API = {
      ...baseApi,
      ...mergedNodeApi,
    };

    contextBridge.exposeInMainWorld("App", API);
  } catch (error) {
    console.error("Failed to register preload APIs", error);
    contextBridge.exposeInMainWorld("App", baseApi);
  }
};

void registerPreloadApis();
