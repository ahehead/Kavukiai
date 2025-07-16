import { test, expect, vi } from 'vitest'

vi.mock('renderer/features/services/appService', () => ({
  electronApiService: { startServer: vi.fn() }
}))

import { LMStudioStartNode } from 'renderer/nodeEditor/nodes/Node/LMStudio/LMStudioStartNode'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import type { Schemes } from 'renderer/nodeEditor/types'
import { NodeStatus } from 'renderer/nodeEditor/types/Node/BaseNode'

const area = { update: vi.fn() } as unknown as AreaPlugin<Schemes, any>
const controlflow = {} as unknown as ControlFlowEngine<Schemes>

function createNode() {
  return new LMStudioStartNode(area, controlflow)
}

test('execute starts server and forwards exec', async () => {
  const node = createNode()
  const { electronApiService } = await import('renderer/features/services/appService') as any
  electronApiService.startServer.mockResolvedValueOnce({ status: 'success', data: 'ok' })
  const forward = vi.fn()
  await node.execute('exec', forward)
  expect(electronApiService.startServer).toHaveBeenCalled()
  expect(node.status).toBe(NodeStatus.COMPLETED)
  expect(forward).toHaveBeenCalledWith('exec')
})

test('execute sets error status on failure', async () => {
  const node = createNode()
  const { electronApiService } = await import('renderer/features/services/appService') as any
  electronApiService.startServer.mockResolvedValueOnce({ status: 'error', message: 'fail' })
  const forward = vi.fn()
  await node.execute('exec', forward)
  expect(node.status).toBe(NodeStatus.ERROR)
  expect(forward).toHaveBeenCalledWith('exec')
})
