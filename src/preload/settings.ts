import { ipcRenderer } from "electron";
import { IpcChannel } from "shared/ApiType";

export const settingsApi = {
  // mainからのリクエスト
  onOpenSettings: (callback: () => void): (() => void) => {
    const listener = () => callback();
    ipcRenderer.on(IpcChannel.OpenSettings, listener);
    return () => ipcRenderer.removeListener(IpcChannel.OpenSettings, listener);
  },
};
