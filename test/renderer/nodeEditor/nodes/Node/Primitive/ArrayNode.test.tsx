import { Type } from '@sinclair/typebox'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { ArrayNode } from 'renderer/nodeEditor/nodes/Node/Primitive/Array/ArrayNode'
import type { AreaExtra, Schemes } from 'renderer/nodeEditor/types'
import { TypedSocket } from 'renderer/nodeEditor/types'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import { expect, test, vi } from 'vitest'

function createStubs() {
  const area = {
    update: vi.fn().mockResolvedValue(undefined),
  } as unknown as AreaPlugin<Schemes, AreaExtra>

  const dataflow = {
    fetchInputSingle: vi.fn(),
    reset: vi.fn(),
  } as unknown as DataflowEngine<Schemes>

  const controlflow = {
    execute: vi.fn(),
  } as unknown as ControlFlowEngine<Schemes>

  return { area, dataflow, controlflow }
}

test('execute pushes first item and forwards exec', async () => {
  const { area, dataflow, controlflow } = createStubs();
  (dataflow.fetchInputSingle as any).mockResolvedValue('first')

  const node = new ArrayNode(area, dataflow, controlflow)
  node.id = 'array-node'

  const forward = vi.fn()
  await node.execute('exec', forward as any)

  expect(dataflow.fetchInputSingle).toHaveBeenCalledWith('array-node', 'item')
  expect(node.controls.itemsView.getValue()).toEqual(['first'])
  expect(forward).toHaveBeenCalledWith('exec')
})

test('schema updates follow connection changes', async () => {
  const { area, dataflow, controlflow } = createStubs()
  const node = new ArrayNode(area, dataflow, controlflow)
  node.id = 'array-node-schema'

  const sourceSocket = new TypedSocket('number', Type.Number())

  const itemSocket = node.inputs.item?.socket
  if (!itemSocket) throw new Error('item socket is undefined')
  await node.onConnectionChangedSchema({
    isConnected: true,
    source: sourceSocket,
    target: itemSocket,
    data: {} as any,
  })

  expect(node.serializeControlValue().data.schemaName).toBe('number')
  const itemSocket2 = node.inputs.item?.socket
  if (!itemSocket2) throw new Error('item socket is undefined')
  itemSocket2.setConnected(false)
  await node.onConnectionChangedSchema({
    isConnected: false,
    source: sourceSocket,
    target: itemSocket2,
    data: { targetInput: "item" } as any,
  })

  expect(node.serializeControlValue().data.schemaName).toBe('any')
  expect(node.outputs.items?.socket.name).toBe('<any>Array')
  expect(area.update).toHaveBeenCalledWith('node', 'array-node-schema')
})

test('serialize and deserialize preserve items and schema', async () => {
  const { area, dataflow, controlflow } = createStubs()
    ; (dataflow.fetchInputSingle as any).mockResolvedValue(42)

  const node = new ArrayNode(area, dataflow, controlflow)
  node.id = 'array-original'

  const numberSocket = new TypedSocket('number', Type.Number())
  const itemSocket = node.inputs.item?.socket
  if (!itemSocket) throw new Error('item socket is undefined')
  await node.onConnectionChangedSchema({
    isConnected: true,
    source: numberSocket,
    target: itemSocket,
    data: {} as any,
  })

  await node.execute('exec', vi.fn() as any)
  const snapshot = node.serializeControlValue()

  const {
    area: area2,
    dataflow: dataflow2,
    controlflow: controlflow2,
  } = createStubs()
  const restored = new ArrayNode(area2, dataflow2, controlflow2)
  restored.id = 'array-restored'
  restored.deserializeControlValue(snapshot.data)
  await restored.setupSchema()

  expect(restored.controls.itemsView.getValue()).toEqual([42])
  expect(restored.outputs.items?.socket.name).toBe('<number>Array')
})
