import { ClassicPreset } from "rete";
import { type, type Type } from "arktype";
import { type DefaultSchemaKey, defaultNodeSchemas } from "./DefaultNodeSchema";

export class TypedSocket extends ClassicPreset.Socket {
  schema: Type;
  readonly isExec: boolean;
  isConnected = false;
  tooltipType?: string; // ツールチップの型情報

  constructor(schemaSpec: NodeSchemaSpec) {
    super(schemaToLabel(normalizeSchema(schemaSpec))); // 省略型情報
    this.schema = normalizeSchema(schemaSpec);
    this.isExec = typeof schemaSpec === "string" && schemaSpec === "exec"; // exec 判定
    this.setTooltipType(this.schema); // ツールチップの型情報を設定
  }

  setTooltipType(schema: Type) {
    this.tooltipType = `
\`\`\`json
${schema.toString()}
\`\`\`
`; // 型情報そのまま
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
    return (
      this.schema.extends(other.schema) || other.schema.extends(this.schema)
    );
  }

  setSchema(schema: Type): void {
    this.schema = schema;
    this.name = schemaToLabel(schema); // ラベル更新
    this.setTooltipType(schema); // ツールチップの型情報を更新
  }
  getSchema(): Type {
    return this.schema;
  }
}

/* ---------- ファクトリ ---------- */
export function createSocket(spec: NodeSchemaSpec): TypedSocket {
  return new TypedSocket(spec);
}

/* ---------- 受け取れる型 ---------- */
export type NodeSchemaSpec =
  | DefaultSchemaKey // "string"
  | "any" // ワイルドカード
  | DefaultSchemaKey[] // ["string","number"]
  | Type; // 既に作られた ArkType スキーマ

/* ---------- ヘルパー ---------- */
export function normalizeSchema(schemaSpec: NodeSchemaSpec): Type {
  if (schemaSpec === "any") return type("unknown");
  if (Array.isArray(schemaSpec)) return unionSchemas(schemaSpec);
  if (typeof schemaSpec === "string") return defaultNodeSchemas[schemaSpec];
  return schemaSpec; // 既に Type
}

function unionSchemas(keys: DefaultSchemaKey[]): Type {
  return keys.map((k) => defaultNodeSchemas[k]).reduce((a, b) => a.or(b)); // 可変長 union
}

/** ArkType の Type → 見やすいラベル */
export function schemaToLabel(t: Type): string {
  // よく使うプリミティブを優先判定
  if (t.extends("string")) return "string";
  if (t.extends("number")) return "number";
  if (t.extends("boolean")) return "bool";
  if (t.extends("bigint")) return "bigint";

  if (t.extends("string[]")) return "string[]";
  if (t.extends("number[]")) return "number[]";
  if (t.extends("boolean[]")) return "bool[]";
  if (t.extends("object[]")) return "object[]";
  if (t.extends("Array")) return "Array"; // Array<any> の場合
  if (t.extends("object")) return "object";

  // オブジェクト判定 (array 以外)

  // 2. ArkType 文字列表現をパース
  let raw = t.toString(); // 例: Type<"auto" | "full" | "inherit">
  if (raw.startsWith("Type<")) {
    raw = raw.slice(5, -1); // "auto" | "full" | "inherit"
  }

  // 3. 整形 ─ 空白と引用符の除去
  raw = raw
    .replace(/\s*\|\s*/g, "|") // パイプの両側の空白除去
    .replace(/["]/g, ""); // ダブルクオート除去

  // 4. 配列・Record などを単語に丸める
  raw = raw
    .replace(/unknown\[\]|[A-Za-z0-9_]+\[\]/g, "array") // xxx[]
    .replace(/\bArray<[^>]+>\b/g, "array") // Array<...>
    .replace(/Record<[^>]+>/g, "object"); // Record<...>

  // それ以外は 20 文字で切り詰め
  return raw.length > 20 ? `${raw.slice(0, 17)}…` : raw;
}
