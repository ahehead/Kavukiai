import { BaseNode } from "renderer/nodeEditor/types/Node/BaseNode";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine } from "rete-engine";
import type { AreaExtra, Schemes, TypedSocket } from "renderer/nodeEditor/types";
import { JsonSchemaFormat } from "renderer/nodeEditor/types/Schemas/RequestSchemas";
import { Type } from "@sinclair/typebox";

export class JsonSchemaFormatNode extends BaseNode<
  { schema: TypedSocket },
  { out: TypedSocket },
  object
> {
  constructor(area: AreaPlugin<Schemes, AreaExtra>, dataflow: DataflowEngine<Schemes>) {
    super("JsonSchemaFormat");
    this.addInputPort({
      key: "schema",
      name: "object",
      schema: Type.Object({}),
      label: "schema",
    });
    this.addOutputPort({ key: "out", name: "object", schema: JsonSchemaFormat });
  }

  data(inputs: { schema?: unknown[] }): { out: JsonSchemaFormat } {
    const schema = inputs.schema?.[0] ?? {};
    return {
      out: {
        name: "response_format",
        schema: schema as Record<string, unknown>,
        type: "json_schema",
      },
    } as { out: JsonSchemaFormat };
  }

  async execute(): Promise<void> {}
}
