import type {
  LMStudioChatRequestArgs,
  LMStudioLoadRequestArgs,
} from "@nodes/LMStudio/common/shared/types";
import { ipcRenderer } from "electron";
import { IpcChannel, type IpcResult } from "shared/ApiType";

export const lmstudioApi = {
  listDownloadedModels: (): Promise<IpcResult<any[]>> =>
    ipcRenderer.invoke(IpcChannel.ListLMStudioModels),
  stopServer: (): Promise<IpcResult<string>> =>
    ipcRenderer.invoke(IpcChannel.StopLMStudioServer),
  getServerStatus: (): Promise<IpcResult<any>> =>
    ipcRenderer.invoke(IpcChannel.GetLMStudioStatus),
  unloadAllModels: (): Promise<IpcResult<string>> =>
    ipcRenderer.invoke(IpcChannel.UnloadLMStudioModels),
  loadModel: ({ id, modelKey }: LMStudioLoadRequestArgs) => {
    const { port1, port2 } = new MessageChannel();
    ipcRenderer.postMessage(
      IpcChannel.PortLMStudioLoadModel,
      { id, modelKey },
      [port2]
    );
    window.postMessage({ type: "node-port", id }, "*", [port1]);
  },
  sendChatMessage: ({
    id,
    modelKey,
    chatHistoryData,
    config,
  }: LMStudioChatRequestArgs) => {
    const { port1, port2 } = new MessageChannel();
    ipcRenderer.postMessage(
      IpcChannel.LMStudioChatRequest,
      { id, modelKey, chatHistoryData, config },
      [port2]
    );
    window.postMessage({ type: "node-port", id }, "*", [port1]);
  },
};

export type LMStudioPreloadApi = typeof lmstudioApi;

export const register = (): LMStudioPreloadApi => lmstudioApi;

export default register;
