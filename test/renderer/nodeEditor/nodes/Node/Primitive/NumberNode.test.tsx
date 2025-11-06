import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { NumberNode } from '@nodes/Primitive/Number/renderer/NumberNode'
import type { Schemes } from 'renderer/nodeEditor/types'
import type { AreaPlugin } from 'rete-area-plugin'
import type { HistoryPlugin } from 'rete-history-plugin'
import { expect, test, vi } from 'vitest'

// dummy plugins for instantiation
const history = {} as HistoryPlugin<Schemes>
const area = {} as AreaPlugin<Schemes, any>

// fake dataflow engine with a clearCache spy
const clearCacheSpy = vi.fn()
const dataflow = { reset: clearCacheSpy } as unknown as DataflowEngine<Schemes>

test('NumberNode.data() returns the initial number', () => {
  const node = new NumberNode(42, history, area, dataflow)
  expect(node.data().out).toBe(42)
})

test('serializeControlValue and deserializeControlValue round-trip', () => {
  const node = new NumberNode(1, history, area, dataflow)
  node.controls.numInput.setValue(3)
  const serialized = node.serializeControlValue().data
  expect(serialized.value).toBe(3)

  // reset and then restore
  node.controls.numInput.setValue(0)
  node.deserializeControlValue(serialized)
  expect(node.controls.numInput.value).toBe(3)
})

test('updating numInput triggers dataflow.clearCache', () => {
  const node = new NumberNode(5, history, area, dataflow)
  node.controls.numInput.setValue(6)
  expect(clearCacheSpy).toHaveBeenCalledWith(node.id)
})
