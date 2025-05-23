import { ClassicPreset } from "rete";
import { type, type Type } from "arktype";

/* ---------- スキーマ辞書 ---------- */
export const socketSchemas = {
  string: type("string"),
  number: type("number"),
  boolean: type("boolean"),
  array: type("unknown[]"),
  image: type({ data: "unknown" }).or("string"),
  OpenAIParam: type({ model: "string" }),
  chatContext: type([{ role: "string", content: "string" }]),
  any: type("unknown"), // ワイルドカード
  exec: type.unit("'__EXEC__'"), // 制御フロー用ダミー
} as const;

export type NodeSocketType = keyof typeof socketSchemas;

/* ---------- 受け取れる型 ---------- */
export type SocketSchemaInput =
  | NodeSocketType // "string"
  | "any" // ワイルドカード
  | NodeSocketType[] // ["string","number"]
  | Type; // 既に作られた ArkType スキーマ

/* ---------- ヘルパー ---------- */
function normalizeSchema(input: SocketSchemaInput): Type {
  if (input === "any") return type("unknown");
  if (Array.isArray(input)) return unionSchemas(input);
  if (typeof input === "string") return socketSchemas[input];
  return input; // 既に Type
}

function unionSchemas(keys: NodeSocketType[]): Type {
  return keys.map((k) => socketSchemas[k]).reduce((a, b) => a.or(b)); // 可変長 union
}

/* ---------- NodeSocket ---------- */
export class NodeSocket extends ClassicPreset.Socket {
  readonly schema: Type;
  readonly isExec: boolean;
  isConnected = false;

  constructor(spec: SocketSchemaInput) {
    const label = Array.isArray(spec)
      ? spec.join("|")
      : typeof spec === "string"
      ? spec
      : "custom";

    super(label);

    this.schema = normalizeSchema(spec);
    this.isExec = typeof spec === "string" && spec === "exec"; // exec 判定
  }

  setConnected(connected: boolean) {
    this.isConnected = connected;
  }

  /* 接続判定 */
  isCompatibleWith(other: NodeSocket): boolean {
    //any型もあるので exec ⇔ exec のみ で判定
    if (this.isExec || other.isExec) {
      return this.isExec && other.isExec;
    }
    // それ以外は ArkType の extends 判定
    return this.schema.extends(other.schema);
  }

  /* 実データ検証*/
  assert(value: unknown) {
    this.schema.assert(value);
  }
}

/* ---------- ファクトリ ---------- */
export function createSocket(spec: SocketSchemaInput) {
  return new NodeSocket(spec);
}
