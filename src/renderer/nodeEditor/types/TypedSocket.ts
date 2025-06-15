import { ClassicPreset } from "rete";
import { type TSchema, Type } from "@sinclair/typebox";

export class TypedSocket extends ClassicPreset.Socket {
  schema: TSchema;
  readonly isExec: boolean;
  isConnected = false;
  tooltip?: string; // ツールチップの型情報

  constructor(typeName: string, schema: TSchema) {
    super(typeName); // 省略型情報
    this.schema = schema;
    this.isExec = typeName === "exec"; // exec 判定
    void this.setTooltip(typeName, this.schema); // ツールチップの型情報を設定
  }

  async setTooltip(name: string, schema: TSchema) {
    this.tooltip = `
\`\`\`typescript
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
    // console.log(
    //   "Type compatibility check:",
    //   this.schema,
    //   other.schema,
    //   t.const
    // );
    return t.const === true;
  }

  getName(): string {
    return this.name;
  }

  async setSchema(name: string, schema: TSchema): Promise<void> {
    this.name = name;
    this.schema = schema;
    await this.setTooltip(name, schema);
  }

  getSchema(): TSchema {
    return this.schema;
  }
}

/* ---------- ファクトリ ---------- */
export function createSocket(name: string, schema: TSchema): TypedSocket {
  return new TypedSocket(name, schema);
}
