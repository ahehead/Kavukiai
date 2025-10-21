import { ipcRenderer } from "electron";
import { IpcChannel, type IpcResult } from "shared/ApiType";

export default {
  stopServer: (): Promise<IpcResult<string>> =>
    ipcRenderer.invoke(IpcChannel.StopLMStudioServer),
};

