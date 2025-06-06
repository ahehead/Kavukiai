import { ClassicPreset } from "rete";
import { type TSchema, Type } from "@sinclair/typebox";

export class TypedSocket extends ClassicPreset.Socket {
  schema: TSchema;
  readonly isExec: boolean;
  isConnected = false;
  tooltip?: string; // ツールチップの型情報

  constructor(name: string, schema: TSchema) {
    super(name); // 省略型情報
    this.schema = schema;
    this.isExec = name === "exec"; // exec 判定
    this.setTooltip(this.schema); // ツールチップの型情報を設定
  }

  setTooltip(schema: TSchema) {
    this.tooltip = `
\`\`\`json
${JSON.stringify(schema, null, 2)}
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

    const t = Type.Extends(
      this.schema,
      other.schema,
      Type.Literal(true),
      Type.Literal(false)
    );
    return t.const === true;
  }

  getName(): string {
    return this.name;
  }

  setSchema(name: string, schema: TSchema): void {
    this.name = name;
    this.schema = schema;
    this.setTooltip(schema);
  }
  getSchema(): TSchema {
    return this.schema;
  }
}

/* ---------- ファクトリ ---------- */
export function createSocket(name: string, schema: TSchema): TypedSocket {
  return new TypedSocket(name, schema);
}
