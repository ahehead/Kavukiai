import { describe, expect, test, vi } from 'vitest'
import { IpcChannel } from 'shared/ApiType'

vi.mock('electron', () => ({
  ipcRenderer: { invoke: vi.fn() },
}))

describe('lmstudioApi', () => {
  test('listDownloadedModels invokes ipcRenderer with correct channel', async () => {
    const { lmstudioApi } = await import('preload/lmstudio')
    const { ipcRenderer } = await import('electron') as any
    const mockReturn = Promise.resolve({ status: 'success', data: [] })
    ipcRenderer.invoke.mockReturnValueOnce(mockReturn)
    const result = lmstudioApi.listDownloadedModels()
    expect(ipcRenderer.invoke).toHaveBeenCalledWith(
      IpcChannel.ListLMStudioModels
    )
    expect(result).toBe(mockReturn)
  })

  test('loadModel posts message with port', async () => {
    const { lmstudioApi } = await import('preload/lmstudio')
    const { ipcRenderer } = await import('electron') as any
    const postMessage = vi.fn()
    const winPost = vi.fn()
    ;(global as any).window = { postMessage: winPost }
    ipcRenderer.postMessage = postMessage
    const channel = IpcChannel.PortLMStudioLoadModel
    const args = { id: '1', modelKey: 'test' }
    lmstudioApi.loadModel(args)
    expect(postMessage).toHaveBeenCalled()
    const [calledChannel, data, ports] = postMessage.mock.calls[0]
    expect(calledChannel).toBe(channel)
    expect(data).toEqual(args)
    expect(ports.length).toBe(1)
    expect(winPost).toHaveBeenCalled()
  })
})


