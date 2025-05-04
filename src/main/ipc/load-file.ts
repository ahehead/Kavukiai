import { BrowserWindow, ipcMain } from "electron";
import { openDialogAndReadFile } from "main/menu/openHandler";
import { IpcChannel } from "shared/ApiType";

export const registerLoadFileHandler = () => {
  ipcMain.handle(IpcChannel.LoadFile, async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) {
      console.error("No window found for save dialog");
      return null;
    }
    return await openDialogAndReadFile(win);
  });
};
