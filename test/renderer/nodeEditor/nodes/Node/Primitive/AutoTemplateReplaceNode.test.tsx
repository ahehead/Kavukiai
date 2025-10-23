import { AutoTemplateReplaceNode } from '@nodes/Primitive/String/AutoTemplateReplace/renderer/AutoTemplateReplaceNode'
import { NodeStatus } from 'renderer/nodeEditor/types'
import { expect, test } from 'vitest'

test('AutoTemplateReplaceNode.data replaces placeholders automatically', () => {
  const node = new AutoTemplateReplaceNode()
  const result = node.data({
    template: ['Hello, {{ name }}!'],
    obj: [{ name: 'Alice' }],
  })

  expect(result.out).toBe('Hello, Alice!')
  expect(node.status).toBe(NodeStatus.IDLE)
})

test('AutoTemplateReplaceNode.data sets warning status when keys are missing', () => {
  const node = new AutoTemplateReplaceNode()
  const result = node.data({
    template: ['Hi, {{ name }} {{ surname }}'],
    obj: [{ name: 'Bob' }],
  })

  expect(result.out).toBe('Hi, Bob ')
  expect(node.status).toBe(NodeStatus.WARNING)
})
