import { test, expect, vi } from 'vitest'

vi.mock('renderer/features/services/appService', () => ({
  electronApiService: { stopServer: vi.fn() }
}))

import { LMStudioStopNode } from 'renderer/nodeEditor/nodes/Node/LMStudio/LMStudioStopNode'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import type { Schemes } from 'renderer/nodeEditor/types'
import { NodeStatus } from 'renderer/nodeEditor/types/Node/BaseNode'

const area = { update: vi.fn() } as unknown as AreaPlugin<Schemes, any>
const controlflow = {} as unknown as ControlFlowEngine<Schemes>

function createNode() {
  return new LMStudioStopNode(area, controlflow)
}

test('execute stops server and forwards exec', async () => {
  const node = createNode()
  const { electronApiService } = await import('renderer/features/services/appService') as any
  electronApiService.stopServer.mockResolvedValueOnce({ status: 'success', data: 'ok' })
  const forward = vi.fn()
  await node.execute('exec', forward)
  expect(electronApiService.stopServer).toHaveBeenCalled()
  expect(node.status).toBe(NodeStatus.COMPLETED)
  expect(forward).toHaveBeenCalledWith('exec')
})

test('execute sets error status on failure', async () => {
  const node = createNode()
  const { electronApiService } = await import('renderer/features/services/appService') as any
  electronApiService.stopServer.mockResolvedValueOnce({ status: 'error', message: 'fail' })
  const forward = vi.fn()
  await node.execute('exec', forward)
  expect(node.status).toBe(NodeStatus.ERROR)
  expect(forward).toHaveBeenCalledWith('exec')
})
