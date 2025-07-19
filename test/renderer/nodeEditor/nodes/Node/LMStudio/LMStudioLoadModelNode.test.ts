import { test, expect, vi } from 'vitest'

vi.mock('renderer/features/services/appService', () => ({
  electronApiService: { loadModel: vi.fn() }
}))

import { LMStudioLoadModelNode } from 'renderer/nodeEditor/nodes/Node/LMStudio/LMStudioLoadModelNode'
import type { AreaPlugin } from 'rete-area-plugin'
import type { DataflowEngine, ControlFlowEngine } from 'rete-engine'
import type { Schemes } from 'renderer/nodeEditor/types'
import { NodeStatus } from 'renderer/nodeEditor/types/Node/BaseNode'

const area = { update: vi.fn() } as unknown as AreaPlugin<Schemes, any>
const dataflow = { fetchInputs: vi.fn() } as unknown as DataflowEngine<Schemes>
const controlflow = {} as ControlFlowEngine<Schemes>

function createNode() {
  return new LMStudioLoadModelNode(area, dataflow, controlflow)
}

test('stopExecution aborts running port', async () => {
  const node = createNode()
  const post = vi.fn()
  const close = vi.fn()
  node.port = { postMessage: post, close } as unknown as MessagePort
  node.status = NodeStatus.RUNNING
  const spy = vi.spyOn(node.controls.console, 'addValue')
  await (node as any).stopExecution()
  expect(post).toHaveBeenCalledWith({ type: 'abort' })
  expect(close).toHaveBeenCalled()
  expect(node.status).toBe(NodeStatus.IDLE)
  expect(spy).toHaveBeenCalledWith('Stop')
})

test('handlePortMessage processes events', async () => {
  const node = createNode()
  const close = vi.fn()
  node.port = { close } as unknown as MessagePort
  const forward = vi.fn()
  node.status = NodeStatus.RUNNING
  await (node as any).handlePortMessage({ data: { type: 'progress', progress: 0.5 } } as MessageEvent, forward)
  expect(node.status).toBe(NodeStatus.RUNNING)
  await (node as any).handlePortMessage({ data: { type: 'done' } } as MessageEvent, forward)
  expect(node.status).toBe(NodeStatus.COMPLETED)
  expect(forward).toHaveBeenCalledWith('exec')
  expect(close).toHaveBeenCalled()
})
