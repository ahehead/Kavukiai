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
  const conf = new Conf<ApplicationSettings>({
    name: ConfFileName.ApplicationSettings,
    defaults: createDefaultApplicationSettings(),
  });
  const { canceled, filePaths } = await dialog.showOpenDialog(window, {
    defaultPath: conf.get("systemSettings.lastDir"),
    properties: ["openFile"],
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (canceled || filePaths.length === 0) return;
  const content = await fs.readFile(filePaths[0], "utf-8");
  conf.set("systemSettings.lastDir", path.dirname(filePaths[0]));
  window.webContents.send(
    IpcChannel.FileLoadedRequest,
    filePaths[0],
    path.parse(filePaths[0]).name,
    JSON.parse(content) as GraphJsonData
  );
}
