import { ipcRenderer } from "electron";
import { IpcChannel, type OpenAIParams, type StreamArgs } from "shared/ApiType";

export const openAIApi = {
  openAIRequest: (params: OpenAIParams): Promise<string> =>
    ipcRenderer.invoke(IpcChannel.OpenAIRequest, params),

  streamChatGpt: ({ id, param }: StreamArgs) => {
    const { port1, port2 } = new MessageChannel();
    // ① port2 → Main
    ipcRenderer.postMessage(IpcChannel.StreamChatGpt, { id, param }, [port2]);
    // ② port1 → Renderer-MainWorld
    window.postMessage({ type: "node-port", id }, "*", [port1]);
  },
};
