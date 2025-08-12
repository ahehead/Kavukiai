import { contextBridge } from "electron";
import { apiKeyApi } from "./apiKeys";
import { appStateApi } from "./appState";
import { comfyuiApi } from "./comfyui";
import { fileOperationsApi } from "./fileOperations";
import { lmstudioApi } from "./lmstudio";
import { openAIApi } from "./openAI";
import { settingsApi } from "./settings";

declare global {
  interface Window {
    App: typeof API; // This will infer the types from the API object
  }
}

const API = {
  // アプリの状態関連
  ...appStateApi,
  // apiキー関連
  ...apiKeyApi,
  // OpenAI関連
  ...openAIApi,
  // LMStudio関連
  ...lmstudioApi,
  // ComfyUI関連
  ...comfyuiApi,
  // 設定関連
  ...settingsApi,
  // ファイル操作関連
  ...fileOperationsApi,
};

contextBridge.exposeInMainWorld("App", API);
