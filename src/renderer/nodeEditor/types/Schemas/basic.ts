import { type } from "arktype";

export const basicSchemas = {
  null: type("null"),
  string: type("string"),
  number: type("number"),
  boolean: type("boolean"),
  array: type("unknown[]"),
  object: type("object"),
  "string[]": type("string[]"),
  "number[]": type("number[]"),
  "boolean[]": type("boolean[]"),
  "object[]": type("object[]"),
  "unknown[]": type("unknown[]"),
  image: type({ data: "unknown" }).or("string"),
  OpenAIParam: type({ model: "string" }),
  chatContext: type([{ role: "string", content: "string" }]),
  date: type("Date"),
  jsonSchema: type("string"),
  unknown: type("unknown"),
  exec: type.unit(Symbol("exec")),
} as const;
