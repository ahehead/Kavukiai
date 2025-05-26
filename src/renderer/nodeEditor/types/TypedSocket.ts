import { ClassicPreset } from "rete";
import { type, type Type } from "arktype";

/* ---------- ノードで使うスキーマ一覧 ---------- */
export const defaultSchemas = {
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

export type DefaultSchemaKey = keyof typeof defaultSchemas;

/* ---------- 受け取れる型 ---------- */
export type NodeSchemaSpec =
  | DefaultSchemaKey // "string"
  | "any" // ワイルドカード
  | DefaultSchemaKey[] // ["string","number"]
  | Type; // 既に作られた ArkType スキーマ

/* ---------- ヘルパー ---------- */
function normalizeSchema(schemaSpec: NodeSchemaSpec): Type {
  if (schemaSpec === "any") return type("unknown");
  if (Array.isArray(schemaSpec)) return unionSchemas(schemaSpec);
  if (typeof schemaSpec === "string") return defaultSchemas[schemaSpec];
  return schemaSpec; // 既に Type
}

function unionSchemas(keys: DefaultSchemaKey[]): Type {
  return keys.map((k) => defaultSchemas[k]).reduce((a, b) => a.or(b)); // 可変長 union
}

export class TypedSocket extends ClassicPreset.Socket {
  readonly schema: Type;
  readonly isExec: boolean;
  isConnected = false;

  constructor(schemaSpec: NodeSchemaSpec) {
    const label = Array.isArray(schemaSpec)
      ? schemaSpec.join("|")
      : typeof schemaSpec === "string"
      ? schemaSpec
      : "custom";

    super(label);

    this.schema = normalizeSchema(schemaSpec);
    this.isExec = typeof schemaSpec === "string" && schemaSpec === "exec"; // exec 判定
  }

  setConnected(connected: boolean) {
    this.isConnected = connected;
  }

  /* 接続判定 */
  isCompatibleWith(other: TypedSocket): boolean {
    //any型もあるので exec ⇔ exec のみ で判定
    if (this.isExec || other.isExec) {
      return this.isExec && other.isExec;
    }
    // それ以外は ArkType の extends 判定
    return this.schema.extends(other.schema);
  }
}

/* ---------- ファクトリ ---------- */
export function createSocket(spec: NodeSchemaSpec): TypedSocket {
  return new TypedSocket(spec);
}
