import { test, expect } from 'vitest';
import { ObjectToYAMLStringNode } from 'renderer/nodeEditor/nodes/Node/Primitive/String/ObjectToYAMLStringNode';

test('ObjectToYAMLStringNode converts object to YAML string', () => {
  const node = new ObjectToYAMLStringNode();
  const out = node.data({ obj: [{ a: 1 }] }).out.trim();
  expect(out).toBe('a: 1');
});
