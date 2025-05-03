import { ipcMain, dialog, BrowserWindow } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
import { CloseFileDialogResponse, IpcChannel } from "shared/ApiType";
import type { GraphJsonData } from "shared/JsonType";
import os from "node:os";
import { Conf } from "electron-conf/main";
import {
  ConfFileName,
  createDefaultApplicationSettings,
  type ApplicationSettings,
} from "main/types";
import { hashGraph } from "renderer/features/dirty-check/hash";

const conf = new Conf<ApplicationSettings>({
  name: ConfFileName.ApplicationSettings,
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

    const lastSaveDir = conf.get("systemSettings.lastDir") as string | null;

    const defaultPath = lastSaveDir
      ? path.join(lastSaveDir, `${title}.json`)
      : path.join(os.homedir(), `${title}.json`);

    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      filters: [{ name: "JSON", extensions: ["json"] }],
      defaultPath,
      properties: ["showOverwriteConfirmation"],
    });

    if (filePath) {
      // 最後に保存したフォルダのパスを記憶
      conf.set("systemSettings.lastDir", path.dirname(filePath));
    }
    // キャンセルされた場合は null を返す
    return canceled ? null : filePath;
  });

  // save json data
  ipcMain.handle(
    IpcChannel.SaveJsonGraph,
    async (
      event,
      filePath: string,
      graph: GraphJsonData,
      lastHash: string
    ): Promise<{ filePath: string; fileName: string } | null> => {
      try {
        // ファイルを読み込みhashを計算、lastHashと比較
        const fileData = await fs.readFile(filePath, "utf-8");
        if ((await hashGraph(JSON.parse(fileData))) !== lastHash) {
          // 確認ダイアログを表示
          const win = BrowserWindow.fromWebContents(event.sender);
          if (!win) {
            console.error("No window found for save confirmation dialog");
            return null;
          }
          const res = await dialog.showMessageBox(win, {
            type: "warning",
            message: "ファイルは変更されています。上書きしますか？",
            buttons: ["上書き", "キャンセル"],
            defaultId: 0,
            cancelId: 1,
          });
          if (res.response === 1) {
            // キャンセルされた場合は null を返す
            return null;
          }
        }

        await fs.writeFile(filePath, JSON.stringify(graph, null, 2), "utf-8");
        return { filePath, fileName: path.parse(filePath).name };
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
