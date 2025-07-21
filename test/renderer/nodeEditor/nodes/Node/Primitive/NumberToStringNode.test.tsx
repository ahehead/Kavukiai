import { test, expect } from 'vitest';
import { NumberToStringNode } from 'renderer/nodeEditor/nodes/Node/Primitive/String/NumberToStringNode';

test('NumberToStringNode converts number to string', () => {
  const node = new NumberToStringNode();
  expect(node.data({ num: [42] }).out).toBe('42');
});
