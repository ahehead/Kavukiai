import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { ListNode } from 'renderer/nodeEditor/nodes/Node/Primitive/ListNode'
import type { Schemes } from 'renderer/nodeEditor/types'
import type { AreaPlugin } from 'rete-area-plugin'
import { expect, test } from 'vitest'

const area = {} as AreaPlugin<Schemes, any>
const dataflow = {} as DataflowEngine<Schemes>

test('ListNode.data collects input arrays into a single list', () => {
  const node = new ListNode(area, dataflow)
  const result = node.data({
    item1: [1, 2],
    item0: ['a'],
    item3: [3],
  })
  expect(result.out).toEqual(['a', 1, 2, 3])
})
