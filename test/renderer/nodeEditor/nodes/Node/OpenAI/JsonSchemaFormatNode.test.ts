import { test, expect } from "vitest";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine } from "rete-engine";
import type { Schemes } from "renderer/nodeEditor/types";
import { JsonSchemaFormatNode } from "renderer/nodeEditor/nodes/Node/OpenAI/JsonSchemaFormatNode";
import type { HistoryPlugin } from "rete-history-plugin";

const history = { add: vi.fn() } as unknown as HistoryPlugin<Schemes>;
const area = {} as AreaPlugin<Schemes, any>;
const dataflow = {} as DataflowEngine<Schemes>;

test("JsonSchemaFormatNode outputs json_schema object", () => {
  const node = new JsonSchemaFormatNode(history, area, dataflow);
  const result = node.data({ schema: [{ foo: "bar" }] });
  expect(result.out).toEqual({
    type: "json_schema",
    name: "",
    description: "",
    strict: true,
    schema: { foo: "bar", additionalProperties: false },
  });
});
