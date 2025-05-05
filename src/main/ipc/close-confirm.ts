import { ipcMain, dialog } from "electron";
import { CloseFileDialogResponse, IpcChannel } from "shared/ApiType";
import { getWindow } from "../features/window";

export function registerCloseConfirmHandler(): void {
  ipcMain.handle(IpcChannel.ShowCloseConfirm, async (event) => {
    return dialog.showMessageBox(getWindow(event.sender), {
      type: "warning",
      message: "ファイルは未保存です。保存しますか？",
      buttons: ["保存", "保存しない", "キャンセル"],
      defaultId: CloseFileDialogResponse.Confirm,
      cancelId: CloseFileDialogResponse.Cancel,
    });
  });
}
