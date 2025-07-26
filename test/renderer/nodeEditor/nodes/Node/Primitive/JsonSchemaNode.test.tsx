import { Type } from '@sinclair/typebox'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { JsonSchemaNode } from 'renderer/nodeEditor/nodes/Node/Primitive/Object/JsonSchemaNode'
import type { Schemes } from 'renderer/nodeEditor/types'
import type { AreaPlugin } from 'rete-area-plugin'
import type { HistoryPlugin } from 'rete-history-plugin'
import { expect, test, vi } from 'vitest'

const history = { add: vi.fn() } as unknown as HistoryPlugin<Schemes>
const area = { update: vi.fn() } as unknown as AreaPlugin<Schemes, any>
const clearCacheSpy = vi.fn()
const dataflow = { reset: clearCacheSpy } as unknown as DataflowEngine<Schemes>

test('JsonSchemaNode.data() returns object schema built from properties', () => {
  const node = new JsonSchemaNode(history, area, dataflow)
  node.controls.props.addItem({ key: 'a', typeStr: 'string' })
  node.controls.props.addItem({ key: 'b', typeStr: 'number' })
  const schema = node.data().out
  expect(schema).toEqual(Type.Object({ a: Type.String(), b: Type.Number() }))
})
