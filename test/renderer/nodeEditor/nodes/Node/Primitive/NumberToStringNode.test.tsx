import { test, expect } from 'vitest';
import { NumberToStringNode } from '@nodes/Primitive/String/NumberToString/renderer/NumberToStringNode';

test('NumberToStringNode converts number to string', () => {
  const node = new NumberToStringNode();
  expect(node.data({ num: [42] }).out).toBe('42');
});
