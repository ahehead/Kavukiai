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
})


