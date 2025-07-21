import { test, expect, vi } from 'vitest';
import { CodeFenceNode } from 'renderer/nodeEditor/nodes/Node/Primitive/String/CodeFenceNode';
import type { DataflowEngine } from 'rete-engine';
import type { Schemes } from 'renderer/nodeEditor/types';

test('CodeFenceNode wraps string in code fence', () => {
  const dataflow = ({ reset: vi.fn() } as unknown) as DataflowEngine<Schemes>;
  const node = new CodeFenceNode(dataflow);
  const res = node.data({ input: ['console.log(1);'], lang: ['js'] });
  expect(res.out).toBe('```js\nconsole.log(1);\n```');
});
