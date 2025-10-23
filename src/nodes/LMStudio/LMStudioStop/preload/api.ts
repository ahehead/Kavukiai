import { ipcRenderer } from "electron";
import { IpcChannel, type IpcResult } from "shared/ApiType";

const api = {
  stopServer: (): Promise<IpcResult<string>> =>
    ipcRenderer.invoke(IpcChannel.StopLMStudioServer),
};

export type LMStudioStopPreloadApi = typeof api;

export default api;
