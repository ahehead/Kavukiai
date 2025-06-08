import { test, expect, vi } from 'vitest';
import { StringNode } from './StringNode';
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

test('StringNode.data() returns the initial string', () => {
  const node = new StringNode('initial-value', history, area, dataflow);
  expect(node.data().out).toBe('initial-value');
});

test('serializeControlValue and deserializeControlValue round-trip', () => {
  const node = new StringNode('foo', history, area, dataflow);
  node.controls.textInput.setValue('bar');
  const serialized = node.serializeControlValue().data;
  expect(serialized.value).toBe('bar');

  // reset and then restore
  node.controls.textInput.setValue('');
  node.deserializeControlValue(serialized);
  expect(node.controls.textInput.value).toBe('bar');
});

test('updating textInput triggers dataflow.clearCache', () => {
  const node = new StringNode('x', history, area, dataflow);
  node.controls.textInput.setValue('y');
  expect(clearCacheSpy).toHaveBeenCalledWith(node.id);
});
