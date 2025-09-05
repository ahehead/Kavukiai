import { type TSchema, Type } from "@sinclair/typebox";
import { ClassicPreset } from "rete";
import { isExecKey } from "./Schemes";

export class TypedSocket extends ClassicPreset.Socket {
  schema: TSchema;
  readonly isExec: boolean;
  isConnected = false;
  tooltip?: string; // ツールチップの型情報

  constructor(typeName: string, schema: TSchema) {
    super(typeName); // 省略型情報
    this.schema = schema;
    this.isExec = isExecKey(typeName); // exec 判定
    void this.setTooltip(schema); // ツールチップの型情報を設定
  }

  // 型情報をツールチップに設定
  async setTooltip(schema: TSchema) {
    this.tooltip = `
\`\`\`typescript
${JSON.stringify(schema, null, 2)}
\`\`\`
`;
  }

  setConnected(connected: boolean) {
    this.isConnected = connected;
  }

  /* 接続判定 */
  isCompatibleWith(other: TypedSocket): boolean {
    //any型もあるのでまず exec ⇔ exec のみ で判定
    if (this.isExec || other.isExec) {
      return this.isExec && other.isExec;
    }

    // 型情報が同じなら互換性あり
    if (this.schema === other.schema) {
      return true;
    }

    // TypeBox の Type.Extends で代入可能かの判定で互換性を判定
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

  async setSchema(name: string, schema: TSchema): Promise<void> {
    this.name = name;
    this.schema = schema;
    await this.setTooltip(schema);
  }

  getSchema(): TSchema {
    return this.schema;
  }
}
