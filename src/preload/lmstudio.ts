import { ipcRenderer } from "electron";
import {
  IpcChannel,
  type IpcResult,
  type LMStudioChatRequestArgs,
  type LMStudioLoadRequestArgs,
} from "shared/ApiType";

export const lmstudioApi = {
  listDownloadedModels: (): Promise<IpcResult<any[]>> =>
    ipcRenderer.invoke(IpcChannel.ListLMStudioModels),
  startServer: (): Promise<IpcResult<string>> =>
    ipcRenderer.invoke(IpcChannel.StartLMStudioServer),
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
  }: LMStudioChatRequestArgs) => {
    const { port1, port2 } = new MessageChannel();
    ipcRenderer.postMessage(
      IpcChannel.LMStudioChatRequest,
      { id, modelKey, chatHistoryData },
      [port2]
    );
    window.postMessage({ type: "node-port", id }, "*", [port1]);
  },
};
