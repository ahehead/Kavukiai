import { ipcRenderer } from 'electron'
import { IpcChannel, type IpcResult } from 'shared/ApiType'

export const lmstudioApi = {
  listDownloadedModels: (): Promise<IpcResult<any[]>> =>
    ipcRenderer.invoke(IpcChannel.ListLMStudioModels),
  startServer: (): Promise<IpcResult<string>> =>
    ipcRenderer.invoke(IpcChannel.StartLMStudioServer),
  stopServer: (): Promise<IpcResult<string>> =>
    ipcRenderer.invoke(IpcChannel.StopLMStudioServer),
}

