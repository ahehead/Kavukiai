import { Type } from '@sinclair/typebox'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { JsonSchemaNode } from '@nodes/Primitive/Object/JsonSchema/renderer/JsonSchemaNode'
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
  node.controls.props.addItem({
    key: 'a',
    typeStr: 'string',
    required: false,
    defaultValue: '',
  })
  node.controls.props.addItem({
    key: 'b',
    typeStr: 'number',
    required: false,
    defaultValue: '',
  })
  const schema = node.data().out
  expect(schema).toEqual(
    Type.Object({
      a: Type.Optional(Type.String()),
      b: Type.Optional(Type.Number()),
    })
  )
})

test('JsonSchemaNode marks required properties and applies defaults', () => {
  const node = new JsonSchemaNode(history, area, dataflow)
  node.controls.props.addItem({
    key: 'title',
    typeStr: 'string',
    required: true,
    defaultValue: 'hello',
  })
  node.controls.props.addItem({
    key: 'count',
    typeStr: 'number',
    required: true,
    defaultValue: 3,
  })
  const schema = node.data().out
  expect(schema).toEqual(
    Type.Object({
      title: Type.String({ default: 'hello' }),
      count: Type.Number({ default: 3 }),
    })
  )
})
