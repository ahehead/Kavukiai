import { ClassicPreset } from "rete";
import { type, type Type } from "arktype";
import { type DefaultSchemaKey, defaultNodeSchemas } from "./DefaultNodeSchema";

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
  if (typeof schemaSpec === "string") return defaultNodeSchemas[schemaSpec];
  return schemaSpec; // 既に Type
}

function unionSchemas(keys: DefaultSchemaKey[]): Type {
  return keys.map((k) => defaultNodeSchemas[k]).reduce((a, b) => a.or(b)); // 可変長 union
}

function createSchemaLabel(schemaSpec: NodeSchemaSpec): string {
  return Array.isArray(schemaSpec)
    ? schemaSpec.join("|")
    : typeof schemaSpec === "string"
    ? schemaSpec
    : "custom";
}

export class TypedSocket extends ClassicPreset.Socket {
  readonly schema: Type;
  readonly isExec: boolean;
  isConnected = false;

  constructor(schemaSpec: NodeSchemaSpec) {
    super(createSchemaLabel(schemaSpec));

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
