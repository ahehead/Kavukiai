import { contextBridge, ipcRenderer } from "electron";
import type { ApiKeysFlags } from "shared/ApiKeysType";
import {
  type FileData,
  IpcChannel,
  type IpcResult,
  type IpcResultDialog,
  type OpenAIParams,
  type StreamArgs,
} from "shared/ApiType";

import type { MainState, PersistedMainState } from "shared/AppType";
import type { GraphJsonData } from "shared/JsonType";

declare global {
  interface Window {
    App: typeof API; // This will infer the types from the API object
  }
}

const API = {
  // アプリの状態を復元
  loadAppStateSnapshot: (): Promise<MainState> =>
    ipcRenderer.invoke(IpcChannel.LoadSnapshot),
  // アプリの状態をスナップショットする
  takeAppStateSnapshot: (state: PersistedMainState): void =>
    ipcRenderer.send(IpcChannel.SaveSnapshot, state),

  saveApiKey: (
    service: keyof ApiKeysFlags,
    key: string
  ): Promise<IpcResult<ApiKeysFlags>> =>
    ipcRenderer.invoke(IpcChannel.SaveApiKey, service, key),

  openAIRequest: (params: OpenAIParams): Promise<string> =>
    ipcRenderer.invoke(IpcChannel.OpenAIRequest, params),
  onOpenSettings: (callback: () => void): (() => void) => {
    const listener = () => callback();
    ipcRenderer.on(IpcChannel.OpenSettings, listener);
    return () => ipcRenderer.removeListener(IpcChannel.OpenSettings, listener);
  },

  // mainからのセーブリクエスト
  onSaveGraphInitiate: (callback: () => Promise<boolean>): (() => void) => {
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
  showSaveDialog: (title: string): Promise<string | null> =>
    ipcRenderer.invoke(IpcChannel.ShowSaveDialog, title),

  // グラフを保存
  saveGraphJsonData: (
    filePath: string,
    graph: GraphJsonData,
    lastHash?: string
  ): Promise<IpcResultDialog<{ filePath: string; fileName: string }>> =>
    ipcRenderer.invoke(IpcChannel.SaveJsonGraph, filePath, graph, lastHash),

  // 閉じる時の確認ダイアログ
  showCloseConfirm: (): Promise<{ response: number }> =>
    ipcRenderer.invoke(IpcChannel.ShowCloseConfirm) as Promise<{
      response: number;
    }>,

  // mainからのファイル読み込み通知
  onFileLoadedRequest: (
    callback: (
      e: Electron.IpcRendererEvent,
      fileData: FileData
    ) => Promise<void>
  ): (() => void) => {
    const listener = async (
      _e: Electron.IpcRendererEvent,
      fileData: FileData
    ) => {
      try {
        await callback(_e, fileData);
      } catch (e) {
        console.error("onFileLoadedRequest callback error:", e);
      }
    };
    ipcRenderer.on(IpcChannel.FileLoadedRequest, listener);
    return () =>
      ipcRenderer.removeListener(IpcChannel.FileLoadedRequest, listener);
  },

  // ファイルを読み込む
  loadFile: (): Promise<FileData | null> =>
    ipcRenderer.invoke(IpcChannel.LoadFile),

  // APIキーを読み込む
  loadApiKeys: (): Promise<IpcResult<ApiKeysFlags>> =>
    ipcRenderer.invoke(IpcChannel.LoadApiKeys),

  streamChatGpt: ({ id, param }: StreamArgs) => {
    const { port1, port2 } = new MessageChannel();

    // ① port2 → Main
    ipcRenderer.postMessage(IpcChannel.StreamChatGpt, { id, param }, [port2]);

    // ② port1 → Renderer-MainWorld
    window.postMessage({ type: "node-port", id }, "*", [port1]);
  },
};

contextBridge.exposeInMainWorld("App", API);
