import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { CodeFenceNode } from 'renderer/nodeEditor/nodes/Node/Primitive/String/CodeFenceNode'
import type { Schemes } from 'renderer/nodeEditor/types'
import { expect, test, vi } from 'vitest'

test('CodeFenceNode wraps string in code fence', () => {
  const dataflow = { reset: vi.fn() } as unknown as DataflowEngine<Schemes>
  const node = new CodeFenceNode(dataflow)
  node.inputs.lang.showControl = false;
  const res = node.data({ input: ['console.log(1);'], lang: ['js'] })
  expect(res.out).toBe('```js\nconsole.log(1);\n```')
})
