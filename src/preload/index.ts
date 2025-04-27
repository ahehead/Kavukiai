import { contextBridge, ipcRenderer } from "electron";
import type { AppState } from "shared/AppType";

declare global {
  interface Window {
    App: typeof API;
  }
}

const API = {
  loadAppState: async (): Promise<AppState> => {
    return await ipcRenderer.invoke("load-state");
  },
  saveApiKey: async (key: string | null): Promise<void> => {
    return await ipcRenderer.invoke("save-api-key", key);
  },
  openAIRequest: async (params: any) =>
    ipcRenderer.invoke("openai-request", params),
};

contextBridge.exposeInMainWorld("App", API);
