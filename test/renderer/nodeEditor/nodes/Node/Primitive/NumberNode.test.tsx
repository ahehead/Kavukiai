import { test, expect, vi } from 'vitest';
import { NumberNode } from 'renderer/nodeEditor/nodes/Node/Primitive/NumberNode';
import type { HistoryPlugin } from 'rete-history-plugin';
import type { AreaPlugin } from 'rete-area-plugin';
import type { DataflowEngine } from 'rete-engine';
import type { Schemes } from 'renderer/nodeEditor/types';

// dummy plugins for instantiation
const history = {} as HistoryPlugin<Schemes>;
const area = {} as AreaPlugin<Schemes, any>;

// fake dataflow engine with a clearCache spy
const clearCacheSpy = vi.fn();
const dataflow = ({ reset: clearCacheSpy } as unknown) as DataflowEngine<Schemes>;

test('hello world', () => {
  expect('Hello, Vitest!').toBe('Hello, Vitest!');
});

test('NumberNode.data() returns the initial number', () => {
  const node = new NumberNode(42, history, area, dataflow);
  expect(node.data().out).toBe(42);
});

test('serializeControlValue and deserializeControlValue round-trip', () => {
  const node = new NumberNode(1, history, area, dataflow);
  node.controls.numInput.setValue(3);
  const serialized = node.serializeControlValue().data;
  expect(serialized.value).toBe(3);

  // reset and then restore
  node.controls.numInput.setValue(0);
  node.deserializeControlValue(serialized);
  expect(node.controls.numInput.value).toBe(3);
});

test('updating numInput triggers dataflow.clearCache', () => {
  const node = new NumberNode(5, history, area, dataflow);
  node.controls.numInput.setValue(6);
  expect(clearCacheSpy).toHaveBeenCalledWith(node.id);
});
