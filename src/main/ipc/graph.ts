import { ipcMain, dialog, BrowserWindow } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
import { IpcChannel } from "shared/ApiType";
import type { GraphJsonData } from "shared/JsonType";
import os from "node:os";

export function registerGraphHandlers(): void {
  ipcMain.handle(IpcChannel.ShowSaveDialog, async (event, title) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) {
      console.error("No window found for save dialog");
      return null;
    }
    const result = await dialog.showSaveDialog(win, {
      filters: [{ name: "JSON", extensions: ["json"] }],
      defaultPath: path.join(os.homedir(), `${title}.json`),
      properties: ["showOverwriteConfirmation"],
    });
    return result.canceled ? null : result.filePath;
  });

  ipcMain.handle(
    IpcChannel.SaveJsonGraph,
    async (event, filePath: string, graph: GraphJsonData) => {
      try {
        await fs.writeFile(filePath, JSON.stringify(graph, null, 2), "utf-8");
        return filePath;
      } catch (error) {
        console.error("Graph save failed:", error);
        return null;
      }
    }
  );

  // 閉じる確認ダイアログ
  ipcMain.handle("show-close-confirm", async (event) => {
    // モーダル対象のウィンドウを取得
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) {
      console.error("No window found for close confirmation dialog");
      return { response: 2 }; // キャンセル
    }
    const res = await dialog.showMessageBox(win, {
      type: "warning",
      message: "ファイルは未保存です。保存しますか？",
      buttons: ["保存", "保存しない", "キャンセル"],
      defaultId: 0,
      cancelId: 2,
    });
    return res; // { response: number; }
  });
}
