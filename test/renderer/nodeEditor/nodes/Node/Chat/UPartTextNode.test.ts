import { expect, test } from 'vitest';
import { UPartTextNode } from 'renderer/nodeEditor/nodes/Node/Chat/UPartTextNode';

test('UPartTextNode outputs text part', () => {
  const node = new UPartTextNode('hello');
  expect(node.data({}).out).toEqual({ type: 'text', text: 'hello' });
  expect(node.data({ text: ['world'] }).out).toEqual({ type: 'text', text: 'world' });
});
