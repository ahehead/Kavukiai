import { ipcMain, dialog } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
import { IpcChannel } from "shared/ApiType";
import type { GraphJsonData } from "shared/JsonType";
import { hashGraph } from "renderer/features/dirty-check/hash";
import { getWindow } from "main/features/window";
import { getDefaultSavePath, setLastDir } from "main/features/file/lastDirPath";
import { ApplicationSettingsConf } from "main/features/file/conf";
import writeFileAtomic from "write-file-atomic";

async function isGraphUnchanged(
  filePath: string,
  lastHash: string
): Promise<boolean> {
  const currentHash = await hashGraph(
    JSON.parse(await fs.readFile(filePath, "utf-8"))
  );
  return currentHash === lastHash;
}

/**
 * 指定パスのファイルが存在するかどうかを返す
 */
export async function fileExists(filePath: string): Promise<boolean> {
  return fs
    .access(filePath)
    .then(() => true)
    .catch(() => false);
}

export function registerSaveHandlers(): void {
  // 保存時にダイアログを表示
  ipcMain.handle(IpcChannel.ShowSaveDialog, async (event, title) => {
    const conf = ApplicationSettingsConf();
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

    // 最後に保存したフォルダのパスを記憶
    if (filePath) setLastDir(conf, path.dirname(filePath));

    return filePath;
  });

  // save json data
  ipcMain.handle(
    IpcChannel.SaveJsonGraph,
    async (
      event,
      filePath: string,
      graph: GraphJsonData,
      lastHash?: string // lastHashは、同じファイルを上書きする時だけ
    ): Promise<{ filePath: string; fileName: string } | null> => {
      try {
        // 同名かつファイルがあれば、上書き確認
        if (lastHash !== undefined && (await fileExists(filePath))) {
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
            // キャンセルされた場合は null を返す
            if (res.response === 1) return null;
          }
        }

        await writeFileAtomic(filePath, JSON.stringify(graph, null, 2), {
          mode: 0o600, // パーミッション
          fsync: true, // flush する
        });

        setLastDir(ApplicationSettingsConf(), path.dirname(filePath));

        return { filePath, fileName: path.parse(filePath).name };
      } catch (error: any) {
        console.error(`Graph save failed: ${error.message}`);
        throw new Error(`Graph save failed: ${error.message}`);
      }
    }
  );
}
