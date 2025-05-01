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
  saveApiKey(key: string | null): Promise<ApiKeysFlags>;
  openAIRequest(params: OpenAIParams): Promise<string>;
  onOpenSettings(callback: () => void): void;
  takeAppStateSnapshot(state: PersistedMainState): void;
  onSaveGraphInitiate(callback: () => void): () => Electron.IpcRenderer;
  showSaveDialog(title: string): Promise<string | null>;
  saveGraphJsonData(filePath: string, graph: unknown): Promise<boolean>;
};

const API: AppApi = {
  // アプリの状態を復元
  loadAppStateSnapshot: () => ipcRenderer.invoke(IpcChannel.LoadState),

  saveApiKey: (key) =>
    ipcRenderer.invoke(IpcChannel.SaveApiKey, key) as Promise<ApiKeysFlags>,
  openAIRequest: (params: OpenAIParams) =>
    ipcRenderer.invoke(IpcChannel.OpenAIRequest, params),
  onOpenSettings: (callback) =>
    ipcRenderer.on(IpcChannel.OpenSettings, () => callback()),

  // アプリの状態をスナップショットする
  takeAppStateSnapshot: (state: PersistedMainState) =>
    ipcRenderer.send(IpcChannel.SaveState, state),

  // mainからのファイル保存要請
  onSaveGraphInitiate: (callback): (() => Electron.IpcRenderer) => {
    const listener = () => callback();
    ipcRenderer.on(IpcChannel.SaveGraphInitiate, listener);
    // 解除用関数を返す
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
    ipcRenderer.invoke(
      IpcChannel.SaveGraph,
      filePath,
      graph
    ) as Promise<boolean>,
};

contextBridge.exposeInMainWorld("App", API);
