import { contextBridge, ipcRenderer } from "electron";
import { IpcChannel, type OpenAIParams } from "shared/ApiType";
import type { AppState, ApiKeys } from "shared/AppType";

declare global {
  interface Window {
    App: AppApi;
  }
}

export type AppApi = {
  loadAppState(): Promise<AppState>;
  saveApiKey(key: string | null): Promise<ApiKeys>;
  openAIRequest(params: OpenAIParams): Promise<string>;
  onOpenSettings(callback: () => void): void;
  saveAppState(state: AppState): void;
};

const API: AppApi = {
  loadAppState: () => ipcRenderer.invoke(IpcChannel.LoadState),
  saveApiKey: (key) =>
    ipcRenderer.invoke(IpcChannel.SaveApiKey, key) as Promise<ApiKeys>,
  openAIRequest: (params: OpenAIParams) =>
    ipcRenderer.invoke(IpcChannel.OpenAIRequest, params),
  onOpenSettings: (callback) =>
    ipcRenderer.on(IpcChannel.OpenSettings, () => callback()),
  saveAppState: (state: AppState) =>
    ipcRenderer.send(IpcChannel.SaveState, state),
};

contextBridge.exposeInMainWorld("App", API);
