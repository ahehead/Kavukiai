import { test, expect, vi } from 'vitest'
import { CounterLoopNode } from 'renderer/nodeEditor/nodes/Node/Primitive/Flow/CounterLoopNode'
import type { HistoryPlugin } from 'rete-history-plugin'
import type { AreaPlugin } from 'rete-area-plugin'
import type { DataflowEngine, ControlFlowEngine } from 'rete-engine'
import type { Schemes } from 'renderer/nodeEditor/types'

const history = {} as HistoryPlugin<Schemes>
const area = { update: vi.fn() } as unknown as AreaPlugin<Schemes, any>
const dataflow = {
  fetchInputs: vi.fn(async () => ({ count: [0] })),
  reset: vi.fn(),
} as unknown as DataflowEngine<Schemes>
const controlflow = { execute: vi.fn() } as unknown as ControlFlowEngine<Schemes>

function createNode(initial: number) {
  return new CounterLoopNode(initial, history, area, dataflow, controlflow)
}

test('CounterLoopNode executes until counter reaches zero', async () => {
  const node = createNode(2)
  const forward = vi.fn()
  await node.execute('exec', forward)
  await node.execute('exec', forward)
  await node.execute('exec', forward)
  expect(forward).toHaveBeenCalledTimes(2)
})

test('stop input resets counter', async () => {
  const node = createNode(2)
  const forward = vi.fn()
  await node.execute('exec', forward)
  await node.execute('stop', forward)
  await node.execute('exec', forward)
  expect(forward).toHaveBeenCalledTimes(1)
})

test('serializeControlValue round trip', () => {
  const node = createNode(1)
  const control = node.inputs.count.control as any
  control.setValue(5)
  const json = node.serializeControlValue().data
  control.setValue(0)
  node.deserializeControlValue(json)
  expect(control.getValue()).toBe(5)
})
