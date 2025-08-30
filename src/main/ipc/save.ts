import { promises as fs } from "node:fs";
import path from "node:path";
import { dialog, ipcMain } from "electron";
import { ApplicationSettingsConf } from "main/features/file/conf";
import { getDefaultSavePath, setLastDir } from "main/features/file/lastDirPath";
import { getWindow } from "main/features/window";
import { hashGraph } from "renderer/features/dirty-check/hash";
import {
  IpcChannel,
  type IpcResultDialog,
  type OpenPathDialogOptions,
  type SaveJsonOptions,
} from "shared/ApiType";
import type { GraphJsonData } from "shared/JsonType";
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
    // Configファイル
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

  // パス選択（ファイル/フォルダ）ダイアログ
  ipcMain.handle(
    IpcChannel.ShowOpenPathDialog,
    async (event, opts: OpenPathDialogOptions) => {
      const conf = ApplicationSettingsConf();
      const window = getWindow(event.sender);
      const properties: Electron.OpenDialogOptions["properties"] = [];
      if (opts.mode === "file") properties.push("openFile");
      else if (opts.mode === "folder") properties.push("openDirectory");
      else properties.push("openFile", "openDirectory");

      const { canceled, filePaths } = await dialog.showOpenDialog(window, {
        title: opts.title,
        defaultPath: opts.defaultPath ?? getDefaultSavePath(conf, ""),
        properties,
        filters: opts.filters,
      });

      if (canceled || filePaths.length === 0) return null;
      // 最後に開いたフォルダを保存
      setLastDir(conf, path.dirname(filePaths[0]));
      return filePaths[0];
    }
  );

  // save json data
  ipcMain.handle(
    IpcChannel.SaveJsonGraph,
    async (
      event,
      filePath: string,
      graph: GraphJsonData,
      lastHash?: string, // lastHashは、同じファイルを上書きする時だけ
      options?: SaveJsonOptions
    ): Promise<IpcResultDialog<{ filePath: string; fileName: string }>> => {
      try {
        // 上書き禁止や同一パス禁止
        if (options?.forbidSamePath && options.forbidSamePath === filePath) {
          return {
            status: "error",
            message:
              "元ファイルと同じパスには保存できません。別名を指定してください。",
          };
        }
        if (options?.disallowOverwrite && (await fileExists(filePath))) {
          return {
            status: "error",
            message: "指定のファイルは既に存在します。別名を指定してください。",
          };
        }

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
            // キャンセルされた場合
            if (res.response === 1) {
              return { status: "cancel" };
            }
          }
        }

        await writeFileAtomic(filePath, JSON.stringify(graph, null, 2), {
          mode: 0o600, // パーミッション
        });

        setLastDir(ApplicationSettingsConf(), path.dirname(filePath));

        return {
          status: "success",
          data: { filePath, fileName: path.parse(filePath).name },
        };
      } catch (error: any) {
        console.error(`Graph save failed: ${error.message}`);
        return {
          status: "error",
          message: `ファイルの保存に失敗しました: ${error.message}`,
        };
      }
    }
  );
}
