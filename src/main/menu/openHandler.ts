import { type BrowserWindow, dialog } from "electron";
import { Conf } from "electron-conf";
import {
  type ApplicationSettings,
  ConfFileName,
  createDefaultApplicationSettings,
} from "main/types";
import { promises as fs } from "node:fs";
import path from "node:path";
import { IpcChannel } from "shared/ApiType";
import type { GraphJsonData } from "shared/JsonType";

export async function handleOpenFile(window: BrowserWindow) {
  window.webContents.send(
    IpcChannel.FileLoadedRequest,
    await openDialogAndReadFile(window)
  );
}

export async function openDialogAndReadFile(
  window: BrowserWindow
): Promise<{ path: string; name: string; json: GraphJsonData } | null> {
  const conf = new Conf<ApplicationSettings>({
    name: ConfFileName.ApplicationSettings,
    defaults: createDefaultApplicationSettings(),
  });
  const { canceled, filePaths } = await dialog.showOpenDialog(window, {
    defaultPath: conf.get("systemSettings.lastDir"),
    properties: ["openFile"],
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (canceled || filePaths.length === 0) return null;
  const content = await fs.readFile(filePaths[0], "utf-8");
  conf.set("systemSettings.lastDir", path.dirname(filePaths[0]));
  return {
    path: filePaths[0],
    name: path.parse(filePaths[0]).name,
    json: JSON.parse(content) as GraphJsonData,
  };
}
