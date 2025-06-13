import { test, expect } from 'vitest';
import type { AreaPlugin } from 'rete-area-plugin';
import type { DataflowEngine } from 'rete-engine';
import type { Schemes } from 'renderer/nodeEditor/types';
import { ResponseTextConfigNode } from 'renderer/nodeEditor/nodes/Node/OpenAI/ResponseTextConfigNode';
import type { JsonSchemaFormat } from 'renderer/nodeEditor/types/Schemas/RequestSchemas';

const area = {} as AreaPlugin<Schemes, any>;
const dataflow = {} as DataflowEngine<Schemes>;

const format: JsonSchemaFormat = {
  name: 'response_format',
  schema: {},
  type: 'json_schema',
};

test('ResponseTextConfigNode returns empty object when no format', () => {
  const node = new ResponseTextConfigNode(area, dataflow);
  const result = node.data({});
  expect(result.out).toEqual({});
});

test('ResponseTextConfigNode outputs format when provided', () => {
  const node = new ResponseTextConfigNode(area, dataflow);
  const result = node.data({ format: [format] });
  expect(result.out).toEqual({ format });
});
