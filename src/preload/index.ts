import { contextBridge } from "electron";
import { loadModules } from "lib/loadModules";
import type { ComfyUIPreloadApi } from "@nodes/ComfyUI/common/preload/api";
import type { LMStudioPreloadApi } from "@nodes/LMStudio/common/preload/api";
import type { LMStudioStartPreloadApi } from "@nodes/LMStudio/LMStudioStart/preload/api";
import type { LMStudioStopPreloadApi } from "@nodes/LMStudio/LMStudioStop/preload/api";
import type { OpenAIPreloadApi } from "@nodes/OpenAI/common/preload/api";
import { apiKeyApi } from "./apiKeys";
import { appStateApi } from "./appState";
import { fileOperationsApi } from "./fileOperations";
import { settingsApi } from "./settings";

type NodePreloadApis = LMStudioPreloadApi &
  LMStudioStartPreloadApi &
  LMStudioStopPreloadApi &
  ComfyUIPreloadApi &
  OpenAIPreloadApi;

const baseApi = {
  ...appStateApi,
  ...apiKeyApi,
  ...settingsApi,
  ...fileOperationsApi,
};

type BaseApi = typeof baseApi;
type PreloadApi = BaseApi & NodePreloadApis;

declare global {
  interface Window {
    App: PreloadApi;
  }
}

type PreloadApiFactory = Record<string, unknown>;

type PreloadModuleExports = {
  register?: () => PreloadApiFactory;
  default?: PreloadApiFactory | (() => PreloadApiFactory);
  expose?: PreloadApiFactory;
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

    const mergedNodeApi = Object.assign(
      {},
      ...nodeApis
    ) as NodePreloadApis;

    const API: PreloadApi = {
      ...baseApi,
      ...mergedNodeApi,
    };

    contextBridge.exposeInMainWorld("App", API);
  } catch (error) {
    console.error("Failed to register preload APIs", error);
    contextBridge.exposeInMainWorld("App", baseApi as PreloadApi);
  }
};

void registerPreloadApis();
