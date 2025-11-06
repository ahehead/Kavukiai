import { test, expect } from 'vitest';
import { ObjectToStringNode } from '@nodes/Primitive/String/ObjectToString/renderer/ObjectToStringNode';

test('ObjectToStringNode converts object to formatted string', () => {
  const node = new ObjectToStringNode();
  const out = node.data({ obj: [{ a: 1 }] }).out;
  expect(out.trim()).toBe('{\n  "a": 1\n}');
});
