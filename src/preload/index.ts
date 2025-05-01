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
  loadAppStateSnapshot(): Promise<MainState>;
  takeAppStateSnapshot(state: PersistedMainState): void;

  saveApiKey(key: string | null): Promise<ApiKeysFlags>;
  openAIRequest(params: OpenAIParams): Promise<string>;

  onOpenSettings(callback: () => void): () => void;

  onSaveGraphInitiate(callback: () => Promise<boolean>): () => void;
  showSaveDialog(title: string): Promise<string | null>;
  saveGraphJsonData(filePath: string, graph: unknown): Promise<string | null>;

  // 閉じる時の確認ダイアログ
  showCloseConfirm(): Promise<{ response: number }>;
};

const API: AppApi = {
  // アプリの状態を復元
  loadAppStateSnapshot: () => ipcRenderer.invoke(IpcChannel.LoadSnapshot),
  // アプリの状態をスナップショットする
  takeAppStateSnapshot: (state: PersistedMainState) =>
    ipcRenderer.send(IpcChannel.SaveSnapshot, state),

  saveApiKey: (key) =>
    ipcRenderer.invoke(IpcChannel.SaveApiKey, key) as Promise<ApiKeysFlags>,
  openAIRequest: (params: OpenAIParams) =>
    ipcRenderer.invoke(IpcChannel.OpenAIRequest, params),
  onOpenSettings: (callback) => {
    const listener = () => callback();
    ipcRenderer.on(IpcChannel.OpenSettings, listener);
    return () => ipcRenderer.removeListener(IpcChannel.OpenSettings, listener);
  },

  onSaveGraphInitiate: (callback) => {
    const listener = async () => {
      try {
        await callback();
      } catch (e) {
        console.error("onSaveGraphInitiate callback error:", e);
      }
    };
    ipcRenderer.on(IpcChannel.SaveGraphInitiate, listener);
    return () =>
      ipcRenderer.removeListener(IpcChannel.SaveGraphInitiate, listener);
  },
  // ダイアログを開く
  showSaveDialog: (title: string) =>
    ipcRenderer.invoke(IpcChannel.ShowSaveDialog, title) as Promise<
      string | null
    >,

  // グラフを保存
  saveGraphJsonData: (filePath, graph) =>
    ipcRenderer.invoke(IpcChannel.SaveJsonGraph, filePath, graph) as Promise<
      string | null
    >,

  showCloseConfirm: () =>
    ipcRenderer.invoke("show-close-confirm") as Promise<{
      response: number;
    }>,
};

contextBridge.exposeInMainWorld("App", API);
