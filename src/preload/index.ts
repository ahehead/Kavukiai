import { contextBridge, ipcRenderer } from "electron";
import type { AppState } from "shared/AppType";

declare global {
  interface Window {
    App: typeof API;
  }
}

const API = {
  loadAppState: async (): Promise<AppState> => {
    return await ipcRenderer.invoke("load-state");
  },
};

contextBridge.exposeInMainWorld("App", API);
