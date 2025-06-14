import { test, expect, vi } from 'vitest';
import { ObjectInputNode } from 'renderer/nodeEditor/nodes/Node/Primitive/ObjectInputNode';
import type { HistoryPlugin } from 'rete-history-plugin';
import type { AreaPlugin } from 'rete-area-plugin';
import type { DataflowEngine } from 'rete-engine';
import type { Schemes } from 'renderer/nodeEditor/types';
import { Type } from '@sinclair/typebox';

const history = {} as HistoryPlugin<Schemes>;
const area = {} as AreaPlugin<Schemes, any>;
const clearCacheSpy = vi.fn();
const dataflow = ({ reset: clearCacheSpy } as unknown) as DataflowEngine<Schemes>;

test('ObjectInputNode builds inputs from schema and outputs object', async () => {
  const node = new ObjectInputNode(history, area, dataflow);
  const schema = Type.Object({ a: Type.String(), b: Type.Number(), c: Type.Boolean() });
  await node.inputs.schema.socket.setSchema('object', schema);
  await node.setupSchema();

  (node.inputs.a?.control as any).setValue('x');
  (node.inputs.b?.control as any).setValue(1);
  (node.inputs.c?.control as any).setValue(true);

  const result = node.data({});
  expect(result.out).toEqual({ a: 'x', b: 1, c: true });
  expect(Object.keys(node.inputs).sort()).toEqual(['schema', 'a', 'b', 'c'].sort());
});

test('control update triggers dataflow reset', async () => {
  const node = new ObjectInputNode(history, area, dataflow);
  const schema = Type.Object({ a: Type.String() });
  await node.inputs.schema.socket.setSchema('object', schema);
  await node.setupSchema();
  (node.inputs.a?.control as any).setValue('y');
  expect(clearCacheSpy).toHaveBeenCalledWith(node.id);
});

