import { ipcRenderer } from "electron";
import { IpcChannel, type IpcResult } from "shared/ApiType";

const api = {
  startServer: (): Promise<IpcResult<string>> =>
    ipcRenderer.invoke(IpcChannel.StartLMStudioServer),
};

export type LMStudioStartPreloadApi = typeof api;

export default api;
