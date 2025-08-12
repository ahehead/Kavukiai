import { ipcRenderer } from "electron";
import { IpcChannel } from "shared/ApiType";
import type { ComfyUIRunRequestArgs } from "shared/ComfyUIType";

export const comfyuiApi = {
  runRecipe: ({ id, recipe }: ComfyUIRunRequestArgs) => {
    const { port1, port2 } = new MessageChannel();
    ipcRenderer.postMessage(IpcChannel.PortComfyUIRunRecipe, { id, recipe }, [
      port2,
    ]);
    window.postMessage({ type: "node-port", id }, "*", [port1]);
  },
};
