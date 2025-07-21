import { test, expect } from 'vitest';
import { ObjectToStringNode } from 'renderer/nodeEditor/nodes/Node/Primitive/String/ObjectToStringNode';

test('ObjectToStringNode converts object to formatted string', () => {
  const node = new ObjectToStringNode();
  const out = node.data({ obj: [{ a: 1 }] }).out;
  expect(out.trim()).toBe('{\n  "a": 1\n}');
});
