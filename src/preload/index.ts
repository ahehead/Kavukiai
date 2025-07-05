import { contextBridge } from "electron";
import { apiKeyApi } from "./apiKeys";
import { appStateApi } from "./appState";
import { fileOperationsApi } from "./fileOperations";
import { openAIApi } from "./openAI";
import { lmstudioApi } from "./lmstudio";
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
  // 設定関連
  ...settingsApi,
  // ファイル操作関連
  ...fileOperationsApi,
};

contextBridge.exposeInMainWorld("App", API);
