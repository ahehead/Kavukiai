import { type BrowserWindow, dialog } from "electron";
import { Conf } from "electron-conf";
import {
  type ApplicationSettings,
  ConfFileName,
  createDefaultApplicationSettings,
} from "main/types";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { FileData } from "shared/ApiType";
import type { GraphJsonData } from "shared/JsonType";
import { getLastDir } from "./file/lastDirPath";

export async function openDialogAndReadFile(
  window: BrowserWindow
): Promise<FileData | null> {
  const conf = new Conf<ApplicationSettings>({
    name: ConfFileName.ApplicationSettings,
    defaults: createDefaultApplicationSettings(),
  });

  const { canceled, filePaths } = await dialog.showOpenDialog(window, {
    defaultPath: getLastDir(conf),
    properties: ["openFile"],
    filters: [{ name: "JSON", extensions: ["json"] }],
  });

  if (canceled || filePaths.length === 0) return null;

  const content = await fs.readFile(filePaths[0], "utf-8");

  conf.set("systemSettings.lastDir", path.dirname(filePaths[0]));

  return {
    filePath: filePaths[0],
    fileName: path.parse(filePaths[0]).name,
    json: JSON.parse(content) as GraphJsonData,
  };
}
