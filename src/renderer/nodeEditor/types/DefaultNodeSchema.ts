import { type } from "arktype";

/* ---------- ノードで使うデフォルトのスキーマ一覧 ---------- */

export const defaultNodeSchemas = {
  string: type("string"),
  number: type("number"),
  boolean: type("boolean"),
  array: type("unknown[]"),
  image: type({ data: "unknown" }).or("string"),
  OpenAIParam: type({ model: "string" }),
  chatContext: type([{ role: "string", content: "string" }]),
  date: type("Date"),
  jsonSchema: type("string"),
  any: type("unknown"), // ワイルドカード
  exec: type.unit("'__EXEC__'"), // 制御フロー用ダミー
} as const;

export type DefaultSchemaKey = keyof typeof defaultNodeSchemas;
