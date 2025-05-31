import { type } from "arktype";

/* ---------- ノードで使うデフォルトのスキーマ一覧 ---------- */

export const defaultNodeSchemas = {
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
  exec: type.unit(Symbol("exec")), // 制御フロー用ダミー
} as const;

export type DefaultSchemaKey = keyof typeof defaultNodeSchemas;
