import { test, expect, vi } from 'vitest'
import type { DataflowEngine } from 'rete-engine'
import type { ControlFlowEngine } from 'rete-engine'
import type { Schemes } from 'renderer/nodeEditor/types'
import { CreateSelectNode } from 'renderer/nodeEditor/nodes/Node/Primitive/CreateSelectNode'

const dataflow = { fetchInputs: vi.fn(), reset: vi.fn() } as unknown as DataflowEngine<Schemes>
const controlflow = { execute: vi.fn() } as unknown as ControlFlowEngine<Schemes>

function createNode() {
  return new CreateSelectNode(dataflow, controlflow)
}

test('execute updates options and forwards exec', async () => {
  const node = createNode()
  ;(dataflow.fetchInputs as any).mockResolvedValueOnce({ list: [['a', 'b']] })
  const forward = vi.fn()
  await node.execute('exec', forward)
  expect(node.data().out).toBe('a')
  expect(forward).toHaveBeenCalledWith('exec')
})

