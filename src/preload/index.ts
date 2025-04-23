import { contextBridge, ipcRenderer } from "electron";

declare global {
  interface Window {
    App: typeof API;
  }
}

const API = {
  sayHelloFromBridge: () => console.log("\nHello from bridgeAPI! 👋\n\n"),
  username: process.env.USER,
  loadState: async () => {
    return await ipcRenderer.invoke("load-state");
  },
};

contextBridge.exposeInMainWorld("App", API);
