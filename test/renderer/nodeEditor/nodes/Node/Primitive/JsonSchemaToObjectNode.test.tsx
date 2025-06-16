import { test, expect, vi } from 'vitest';
import { JsonSchemaToObjectNode } from 'renderer/nodeEditor/nodes/Node/Primitive/Object/JsonSchemaToObject';
import { Type } from '@sinclair/typebox';
import type { NodeEditor } from 'rete';
import type { HistoryPlugin } from 'rete-history-plugin';
import type { AreaPlugin } from 'rete-area-plugin';
import type { DataflowEngine, ControlFlowEngine } from 'rete-engine';
import type { Schemes } from 'renderer/nodeEditor/types';

function createNode(fetch: () => Promise<any>) {
  const editor = { getConnections: () => [], removeConnection: vi.fn(), removeNode: vi.fn() } as unknown as NodeEditor<Schemes>;
  const history = {} as HistoryPlugin<Schemes>;
  const area = { update: vi.fn() } as unknown as AreaPlugin<Schemes, any>;
  const dataflow = { fetchInputs: vi.fn(fetch), reset: vi.fn() } as unknown as DataflowEngine<Schemes>;
  const controlflow = { execute: vi.fn() } as unknown as ControlFlowEngine<Schemes>;
  const node = new JsonSchemaToObjectNode(editor, history, area, dataflow, controlflow);
  return { node, area, dataflow };
}

const sampleSchema = Type.Object({
  text: Type.String(),
  count: Type.Number(),
  flag: Type.Boolean(),
});

test('execute builds dynamic inputs from schema', async () => {
  const { node, area } = createNode(async () => ({ schema: [sampleSchema] }));
  await node.execute();
  expect(Object.keys(node.inputs)).toEqual(expect.arrayContaining(['exec', 'schema', 'text', 'count', 'flag']));
  expect(node.outputs.out?.socket.getSchema()).toEqual(sampleSchema);
  expect(area.update).toHaveBeenCalledWith('node', node.id);
});

test('execute with no schema removes dynamic inputs', async () => {
  const { node, dataflow } = createNode(async () => ({ schema: [sampleSchema] }));
  await node.execute();
  dataflow.fetchInputs = vi.fn(async () => ({}));
  await node.execute();
  expect(Object.keys(node.inputs)).toEqual(['exec', 'schema']);
});

test('data collects values from dynamic controls', async () => {
  const { node } = createNode(async () => ({ schema: [sampleSchema] }));
  await node.execute();
  (node.inputs.text?.control as any).setValue('hello');
  (node.inputs.count?.control as any).setValue(5);
  (node.inputs.flag?.control as any).setValue(true);
  const result = node.data({});
  expect(result.out).toEqual({ text: 'hello', count: 5, flag: true });
});

test('deserializeControlValue rebuilds dynamic ports', async () => {
  const { node } = createNode(async () => ({}));
  await node.deserializeControlValue({ schema: sampleSchema });
  expect(Object.keys(node.inputs)).toEqual(expect.arrayContaining(['exec', 'schema', 'text', 'count', 'flag']));
  expect(node.schema).toEqual(sampleSchema);
});
