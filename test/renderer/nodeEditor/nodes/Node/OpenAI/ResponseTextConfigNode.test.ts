import { ResponseTextConfigNode } from "renderer/nodeEditor/nodes/Node/OpenAI/ResponseTextConfigNode";
import type { JsonSchemaFormat } from "renderer/nodeEditor/types/Schemas/openai/RequestSchemas";
import { expect, test } from "vitest";

const format: JsonSchemaFormat = {
  name: "response_format",
  schema: {},
  type: "json_schema",
};

test("ResponseTextConfigNode returns empty object when no format", () => {
  const node = new ResponseTextConfigNode();
  const result = node.data({});
  expect(result.out).toEqual({});
});

test("ResponseTextConfigNode outputs format when provided", () => {
  const node = new ResponseTextConfigNode();
  const result = node.data({ format: [format] });
  expect(result.out).toEqual({ format });
});
