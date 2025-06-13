import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine } from "rete-engine";
import type {
  AreaExtra,
  Schemes,
  TypedSocket,
} from "renderer/nodeEditor/types";
import { JsonSchemaFormat } from "renderer/nodeEditor/types/Schemas/RequestSchemas";
import { Type } from "@sinclair/typebox";
import { InputValueControl } from "../../Controls/input/InputValue";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";
import type { HistoryPlugin } from "rete-history-plugin";
import { CheckBoxControl } from "../../Controls/input/CheckBox";
import { SerializableInputsNode } from "renderer/nodeEditor/types/Node/SerializableInputsNode";
import { getInputValue } from "../../util/getInput";

type JsonSchemaFormatKeys = keyof JsonSchemaFormat;
export class JsonSchemaFormatNode extends SerializableInputsNode<
  Record<JsonSchemaFormatKeys, TypedSocket>,
  { out: TypedSocket },
  object
> {
  constructor(
    private history: HistoryPlugin<Schemes>,
    private area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super("JsonSchemaFormat");
    const opts = {
      history: this.history,
      area: this.area,
      onChange: () => resetCacheDataflow(dataflow, this.id),
    };
    this.addInputPort([
      {
        key: "name",
        name: "string",
        schema: Type.String(),
        label: "name",
        showControl: true,
        control: new InputValueControl<string>({
          value: "test",
          type: "string",
          label: "name",
          ...opts,
        }),
      },
      {
        key: "schema",
        name: "object",
        schema: Type.Object({}),
        label: "schema",
      },
      {
        key: "description",
        name: "string",
        schema: Type.String(),
        label: "description",
        showControl: true,
        control: new InputValueControl<string>({
          value: "test",
          type: "string",
          label: "description",
          ...opts,
        }),
      },
      {
        key: "strict",
        name: "boolean",
        schema: Type.Boolean(),
        label: "strict",
        showControl: true,
        control: new CheckBoxControl({
          value: true,
          label: "strict",
          ...opts,
        }),
      },
    ]);
    this.addOutputPort({
      key: "out",
      name: "object",
      schema: JsonSchemaFormat,
    });
  }

  data(inputs: {
    name?: string[];
    schema?: unknown[];
    description?: string[];
    strict?: boolean[];
  }): { out: JsonSchemaFormat } {
    let schema = inputs.schema?.[0] ?? {};
    schema = { ...schema, additionalProperties: false };
    return {
      out: {
        type: "json_schema",
        ...{
          name: getInputValue(this.inputs, "name", inputs),
          description: getInputValue(this.inputs, "description", inputs),
          strict: getInputValue(this.inputs, "strict", inputs),
        },
        schema: schema as Record<string, unknown>,
      },
    } as { out: JsonSchemaFormat };
  }

  async execute(): Promise<void> {}
}
