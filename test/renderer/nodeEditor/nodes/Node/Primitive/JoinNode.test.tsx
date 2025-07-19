import { test, expect } from 'vitest'
import { JoinNode } from 'renderer/nodeEditor/nodes/Node/Primitive/String/JoinNode'

test('JoinNode.data joins strings with separator', () => {
  const node = new JoinNode()
  const result = node.data({ list: [['a', 'b', 'c']], separator: [','] })
  expect(result.out).toBe('a,b,c')
})
