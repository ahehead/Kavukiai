import { ObjectToYAMLStringNode } from '@nodes/Primitive/String/ObjectToYAMLString/renderer/ObjectToYAMLStringNode'
import { expect, test } from 'vitest'

test('ObjectToYAMLStringNode converts object to YAML string', () => {
  const node = new ObjectToYAMLStringNode()
  const out = node.data({ obj: [{ a: 1 }] }).out.trim()
  expect(out).toBe('a: 1')
})
