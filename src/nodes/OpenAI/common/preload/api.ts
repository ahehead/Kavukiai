import { ipcRenderer } from "electron";
import { IpcChannel, type OpenAIRequestArgs } from "shared/ApiType";

const openAIApi = {
  sendChatGptMessage: ({ id, param }: OpenAIRequestArgs) => {
    const { port1, port2 } = new MessageChannel();
    ipcRenderer.postMessage(IpcChannel.PortChatGpt, { id, param }, [port2]);
    window.postMessage({ type: "node-port", id }, "*", [port1]);
  },
};

export type OpenAIPreloadApi = typeof openAIApi;

export const register = (): OpenAIPreloadApi => openAIApi;

export default register;
