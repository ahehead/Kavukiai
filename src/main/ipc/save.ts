import { ipcMain, dialog, BrowserWindow } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
import { IpcChannel } from "shared/ApiType";
import type { GraphJsonData } from "shared/JsonType";
import os from "node:os";
import { Conf } from "electron-conf/main";
import {
  ConfFileName,
  createDefaultApplicationSettings,
  type ApplicationSettings,
} from "main/types";
import { hashGraph } from "renderer/features/dirty-check/hash";
import { getWindow } from "main/features/window";
import { getDefaultSavePath } from "main/features/file/lastDirPath";

const conf = new Conf<ApplicationSettings>({
  name: ConfFileName.ApplicationSettings,
  defaults: createDefaultApplicationSettings(),
});

async function isGraphUnchanged(
  filePath: string,
  lastHash: string
): Promise<boolean> {
  const currentHash = await hashGraph(
    JSON.parse(await fs.readFile(filePath, "utf-8"))
  );
  return currentHash === lastHash;
}

export function registerSaveHandlers(): void {
  // 保存時にダイアログを表示
  ipcMain.handle(IpcChannel.ShowSaveDialog, async (event, title) => {
    const { canceled, filePath } = await dialog.showSaveDialog(
      getWindow(event.sender),
      {
        filters: [{ name: "JSON", extensions: ["json"] }],
        defaultPath: getDefaultSavePath(conf, title),
        properties: ["showOverwriteConfirmation"],
      }
    );

    // キャンセルされた場合は null を返す
    if (canceled) return null;

    if (filePath) {
      // 最後に保存したフォルダのパスを記憶
      conf.set("systemSettings.lastDir", path.dirname(filePath));
    }
    return filePath;
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
        // ファイルが存在するか確認
        const fileExists = await fs
          .access(filePath)
          .then(() => true)
          .catch(() => false);

        if (fileExists) {
          // ファイルを読み込みhashを計算、lastHashと比較
          if (!(await isGraphUnchanged(filePath, lastHash))) {
            // ファイルが変更されていたら確認ダイアログを表示
            const res = await dialog.showMessageBox(getWindow(event.sender), {
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
        }

        await fs.writeFile(filePath, JSON.stringify(graph, null, 2), "utf-8");
        return { filePath, fileName: path.parse(filePath).name };
      } catch (error) {
        console.error("Graph save failed:", error);
        return null;
      }
    }
  );
}
