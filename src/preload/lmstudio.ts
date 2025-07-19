import { ipcRenderer } from 'electron'
import { IpcChannel, type IpcResult, type LMStudioLoadRequestArgs } from 'shared/ApiType'

export const lmstudioApi = {
  listDownloadedModels: (): Promise<IpcResult<any[]>> =>
    ipcRenderer.invoke(IpcChannel.ListLMStudioModels),
  startServer: (): Promise<IpcResult<string>> =>
    ipcRenderer.invoke(IpcChannel.StartLMStudioServer),
  stopServer: (): Promise<IpcResult<string>> =>
    ipcRenderer.invoke(IpcChannel.StopLMStudioServer),
  loadModel: ({ id, modelKey }: LMStudioLoadRequestArgs) => {
    const { port1, port2 } = new MessageChannel()
    ipcRenderer.postMessage(
      IpcChannel.PortLMStudioLoadModel,
      { id, modelKey },
      [port2]
    )
    window.postMessage({ type: 'node-port', id }, '*', [port1])
  },
}

