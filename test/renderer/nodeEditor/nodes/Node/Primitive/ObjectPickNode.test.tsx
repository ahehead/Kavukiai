import { test, expect } from 'vitest';
import { ObjectPickNode } from 'renderer/nodeEditor/nodes/Node/Primitive/ObjectPickNode';
import type { AreaPlugin } from 'rete-area-plugin';
import type { DataflowEngine } from 'rete-engine';
import type { Schemes } from 'renderer/nodeEditor/types';
import { Type } from '@sinclair/typebox';

const area = {} as AreaPlugin<Schemes, any>;
const dataflow = {} as DataflowEngine<Schemes>;

test('ObjectPickNode outputs properties of the input object', async () => {
  const node = new ObjectPickNode(area, dataflow);
  await node.inputs.obj.socket.setSchema('object', Type.Object({ a: Type.String(), b: Type.Number() }));
  await node.setupSchema();
  const result = node.data({ obj: [{ a: 'x', b: 1 }] });
  expect(result).toEqual({ a: 'x', b: 1 });
  expect(Object.keys(node.outputs)).toEqual(['a', 'b']);
});
