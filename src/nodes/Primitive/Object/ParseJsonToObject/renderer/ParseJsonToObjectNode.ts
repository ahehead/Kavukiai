import type { TSchema } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import {
  NodeStatus,
  SerializableInputsNode,
  type TypedSocket,
} from "renderer/nodeEditor/types";

export class ParseJsonToObjectNode extends SerializableInputsNode<
  "ParseJson",
  { exec: TypedSocket; schema: TypedSocket; value: TypedSocket },
  Record<string, TypedSocket>,
  object
> {
  constructor() {
    super("ParseJson");
    this.width = 260;

    this.addInputPort([
      { key: "schema", typeName: "JsonSchema", label: "schema" },
      {
        key: "value",
        typeName: "string",
        label: "value",
      },
    ]);
    this.addOutputPort({
      key: "out",
      label: "out",
      typeName: "object",
    });
  }

  data(inputs: { schema?: TSchema[]; value?: string[] }): { out: object } {
    const schema = inputs?.schema?.[0];
    const value = inputs?.value?.[0];
    try {
      if (!schema || !value) throw new Error("Schema or value is not set");
      const parsed = Value.Parse(schema, JSON.parse(value)) as object;
      return { out: parsed };
    } catch (error) {
      console.error("[ParseJsonNode] Error parsing JSON:", error);
      this.changeStatus(NodeStatus.ERROR);
      return { out: {} };
    }
  }
}
