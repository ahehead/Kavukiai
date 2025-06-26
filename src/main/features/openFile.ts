import { type BrowserWindow, dialog } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { FileData } from "shared/ApiType";
import type { GraphJsonData } from "shared/JsonType";
import { getLastDir, setLastDir } from "./file/lastDirPath";
import { ApplicationSettingsConf } from "./file/conf";

/**
 * ダイアログを表示してファイルを読み込む
 * @param window - 対象のブラウザウィンドウ
 * @returns 読み込んだファイルのデータ、またはキャンセルされた場合はnull
 */
export async function openDialogAndReadFile(
  window: BrowserWindow
): Promise<FileData | null> {
  const conf = ApplicationSettingsConf();

  const { canceled, filePaths } = await dialog.showOpenDialog(window, {
    defaultPath: getLastDir(conf),
    properties: ["openFile"],
    filters: [{ name: "JSON", extensions: ["json"] }],
  });

  if (canceled || filePaths.length === 0) return null;

  const content = await fs.readFile(filePaths[0], "utf-8");

  setLastDir(conf, path.dirname(filePaths[0]));

  return {
    filePath: filePaths[0],
    fileName: path.parse(filePaths[0]).name, // Tab名に使う
    json: JSON.parse(content) as GraphJsonData,
  };
}
