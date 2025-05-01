import { ipcMain, dialog } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
import { IpcChannel } from "shared/ApiType";
import type { GraphJsonData } from "shared/JsonType";
import os from "node:os";

export function registerGraphHandlers(): void {
  ipcMain.handle(IpcChannel.ShowSaveDialog, async (event, title) => {
    const result = await dialog.showSaveDialog({
      filters: [{ name: "JSON", extensions: ["json"] }],
      defaultPath: path.join(os.homedir(), `${title}.json`),
    });
    return result.canceled ? null : result.filePath;
  });

  ipcMain.handle(
    IpcChannel.SaveGraph,
    async (event, filePath: string, graph: GraphJsonData) => {
      try {
        await fs.writeFile(filePath, JSON.stringify(graph, null, 2), "utf-8");
        return true;
      } catch (error) {
        console.error("Graph save failed:", error);
        return false;
      }
    }
  );
}
