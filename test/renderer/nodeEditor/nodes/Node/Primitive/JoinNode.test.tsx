import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { JoinNode } from 'renderer/nodeEditor/nodes/Node/Primitive/Array/JoinNode'
import type { Schemes } from 'renderer/nodeEditor/types'
import { expect, test } from 'vitest'

const dataflow = { reset: vi.fn() } as unknown as DataflowEngine<Schemes>

test('JoinNode.data joins strings with separator', () => {
  const node = new JoinNode(dataflow)
  const result = node.data({ list: [['a', 'b', 'c']], separator: [','] })
  expect(result.out).toBe('a,b,c')
})
