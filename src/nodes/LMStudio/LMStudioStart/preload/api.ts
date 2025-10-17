import { ipcRenderer } from "electron";
import { IpcChannel, type IpcResult } from "shared/ApiType";

export default {
  startServer: (): Promise<IpcResult<string>> =>
    ipcRenderer.invoke(IpcChannel.StartLMStudioServer),
};
