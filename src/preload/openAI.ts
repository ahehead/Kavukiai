import { ipcRenderer } from "electron";
import { IpcChannel, type OpenAIRequestArgs } from "shared/ApiType";

export const openAIApi = {
  sendChatGptMessage: ({ id, param }: OpenAIRequestArgs) => {
    const { port1, port2 } = new MessageChannel();
    // ① port2 → Main
    ipcRenderer.postMessage(IpcChannel.PortChatGpt, { id, param }, [port2]);
    // ② port1 → Renderer-MainWorld
    window.postMessage({ type: "node-port", id }, "*", [port1]);
  },
};
