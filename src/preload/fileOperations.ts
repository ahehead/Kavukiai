import { ipcRenderer, webUtils } from "electron";
import type {
  ExportPngArgs,
  ImportPngResult,
  OpenPathDialogOptions,
  SaveJsonOptions,
} from "shared/ApiType";
import {
  type FileData,
  IpcChannel,
  type IpcResultDialog,
} from "shared/ApiType";
import type { GraphJsonData } from "shared/JsonType";

export const fileOperationsApi = {
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
  // mainからの「名前を付けて保存」リクエスト
  onSaveAsGraphInitiate: (callback: () => Promise<boolean>): (() => void) => {
    const listener = async () => {
      try {
        await callback();
      } catch (e) {
        console.error("onSaveAsGraphInitiate callback error:", e);
      }
    };
    ipcRenderer.on(IpcChannel.SaveAsGraphInitiate, listener);
    return () =>
      ipcRenderer.removeListener(IpcChannel.SaveAsGraphInitiate, listener);
  },
  // ダイアログを開く
  showSaveDialog: (title: string): Promise<string | null> =>
    ipcRenderer.invoke(IpcChannel.ShowSaveDialog, title),

  // ファイル/フォルダ選択ダイアログ
  showOpenPathDialog: (
    options: OpenPathDialogOptions
  ): Promise<string | null> =>
    ipcRenderer.invoke(IpcChannel.ShowOpenPathDialog, options),

  // グラフを保存
  saveGraphJsonData: (
    filePath: string,
    graph: GraphJsonData,
    lastHash?: string,
    options?: SaveJsonOptions
  ): Promise<IpcResultDialog<{ filePath: string; fileName: string }>> =>
    ipcRenderer.invoke(
      IpcChannel.SaveJsonGraph,
      filePath,
      graph,
      lastHash,
      options
    ),

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

  // 指定パスのJSONを読み込む
  readJsonByPath: (path: string) =>
    ipcRenderer.invoke(IpcChannel.ReadJsonByPath, path),

  // Export current view as PNG with embedded graph data
  exportPngWithData: (
    args: ExportPngArgs
  ): Promise<IpcResultDialog<{ filePath: string }>> =>
    ipcRenderer.invoke(IpcChannel.ExportPngWithData, args),

  // Import embedded workflow from PNG file
  importWorkflowFromPng: (
    filePath: string
  ): Promise<IpcResultDialog<ImportPngResult>> =>
    ipcRenderer.invoke(IpcChannel.ImportWorkflowFromPng, filePath),

  getPathForFile(file: File): string {
    try {
      return webUtils.getPathForFile(file) || "";
    } catch {
      return "";
    }
  },

  /** パスが取れない（ブラウザ由来など）場合は temp に書き出してパスを返す */
  async ensurePathForFile(file: File): Promise<string> {
    const p = this.getPathForFile(file);
    if (p) return p;
    const buf = Buffer.from(await file.arrayBuffer());
    const safeName = (file.name || "image.png").replace(/[^\w.-]/g, "_");
    return ipcRenderer.invoke(IpcChannel.WriteTempFile, {
      name: safeName,
      data: buf,
    });
  },
};
