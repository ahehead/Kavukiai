import { ipcMain } from "electron";
import { openDialogAndReadFile } from "main/features/openFile";
import { getWindow } from "main/features/window";
import { IpcChannel } from "shared/ApiType";

export const registerLoadFileHandler = () => {
  ipcMain.handle(IpcChannel.LoadFile, async (event) => {
    return await openDialogAndReadFile(getWindow(event.sender));
  });
};
