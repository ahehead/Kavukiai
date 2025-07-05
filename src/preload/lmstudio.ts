import { ipcRenderer } from 'electron'
import { IpcChannel, type IpcResult } from 'shared/ApiType'

export const lmstudioApi = {
  listDownloadedModels: (): Promise<IpcResult<any[]>> =>
    ipcRenderer.invoke(IpcChannel.ListLMStudioModels),
}

