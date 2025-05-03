import { ipcMain, dialog, BrowserWindow } from "electron";
import { CloseFileDialogResponse, IpcChannel } from "shared/ApiType";

export function registerCloseConfirmHandler(): void {
  ipcMain.handle(IpcChannel.ShowCloseConfirm, async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) {
      console.error("No window found for close confirmation dialog");
      return { response: CloseFileDialogResponse.Cancel };
    }
    return dialog.showMessageBox(win, {
      type: "warning",
      message: "ファイルは未保存です。保存しますか？",
      buttons: ["保存", "保存しない", "キャンセル"],
      defaultId: CloseFileDialogResponse.Confirm,
      cancelId: CloseFileDialogResponse.Cancel,
    });
  });
}
