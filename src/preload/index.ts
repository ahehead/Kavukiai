import { contextBridge, ipcRenderer } from "electron";
import { IpcChannel, type OpenAIParams } from "shared/ApiType";
import type {
  ApiKeysFlags,
  MainState,
  PersistedMainState,
} from "shared/AppType";

declare global {
  interface Window {
    App: AppApi;
  }
}

export type AppApi = {
  loadAppState(): Promise<MainState>;
  saveApiKey(key: string | null): Promise<ApiKeysFlags>;
  openAIRequest(params: OpenAIParams): Promise<string>;
  onOpenSettings(callback: () => void): void;
  saveAppState(state: PersistedMainState): void;
};

const API: AppApi = {
  loadAppState: () => ipcRenderer.invoke(IpcChannel.LoadState),
  saveApiKey: (key) =>
    ipcRenderer.invoke(IpcChannel.SaveApiKey, key) as Promise<ApiKeysFlags>,
  openAIRequest: (params: OpenAIParams) =>
    ipcRenderer.invoke(IpcChannel.OpenAIRequest, params),
  onOpenSettings: (callback) =>
    ipcRenderer.on(IpcChannel.OpenSettings, () => callback()),
  saveAppState: (state: PersistedMainState) =>
    ipcRenderer.send(IpcChannel.SaveState, state),
};

contextBridge.exposeInMainWorld("App", API);
