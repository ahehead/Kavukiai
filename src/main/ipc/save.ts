import { ipcMain, dialog, BrowserWindow } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
import { CloseFileDialogResponse, IpcChannel } from "shared/ApiType";
import type { GraphJsonData } from "shared/JsonType";
import os from "node:os";
import { Conf } from "electron-conf/main";
import {
  createDefaultApplicationSettings,
  type ApplicationSettings,
} from "main/types";

const conf = new Conf<ApplicationSettings>({
  name: "app-settings",
  defaults: createDefaultApplicationSettings(),
});

export function registerSaveHandlers(): void {
  // save dialog
  ipcMain.handle(IpcChannel.ShowSaveDialog, async (event, title) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) {
      console.error("No window found for save dialog");
      return null;
    }

    const lastSaveDir = conf.get("systemSettings.lastSaveDir") as string | null;
    const defaultPath = lastSaveDir
      ? path.join(lastSaveDir, `${title}.json`)
      : path.join(os.homedir(), `${title}.json`);

    const result = await dialog.showSaveDialog(win, {
      filters: [{ name: "JSON", extensions: ["json"] }],
      defaultPath,
      properties: ["showOverwriteConfirmation"],
    });

    if (result.filePath) {
      // 最後に保存したフォルダのパスを記憶
      conf.set("systemSettings.lastSaveDir", path.dirname(result.filePath));
    }
    // キャンセルされた場合は null を返す
    return result.canceled ? null : result.filePath;
  });

  // save json data
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
  ipcMain.handle(IpcChannel.ShowCloseConfirm, async (event) => {
    // モーダル対象のウィンドウを取得
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) {
      console.error("No window found for close confirmation dialog");
      return { response: CloseFileDialogResponse.Cancel }; // キャンセル
    }
    const res = await dialog.showMessageBox(win, {
      type: "warning",
      message: "ファイルは未保存です。保存しますか？",
      buttons: ["保存", "保存しない", "キャンセル"],
      defaultId: CloseFileDialogResponse.Confirm,
      cancelId: CloseFileDialogResponse.Cancel,
    });
    return res; // { response: number; }
  });
}
