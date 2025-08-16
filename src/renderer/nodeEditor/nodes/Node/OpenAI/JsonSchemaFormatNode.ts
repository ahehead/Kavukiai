import type { DataflowEngine } from "renderer/nodeEditor/features/safe-dataflow/dataflowEngin";
import type {
  AreaExtra,
  Schemes,
  TypedSocket,
} from "renderer/nodeEditor/types";
import { SerializableInputsNode } from "renderer/nodeEditor/types/Node/SerializableInputsNode";
import { JsonSchemaFormat } from "renderer/nodeEditor/types/Schemas/openai/RequestSchemas";
import type { AreaPlugin } from "rete-area-plugin";
import type { HistoryPlugin } from "rete-history-plugin";
import { CheckBoxControl } from "../../Controls/input/CheckBox";
import { InputValueControl } from "../../Controls/input/InputValue";

type JsonSchemaFormatKeys = keyof JsonSchemaFormat;
export class JsonSchemaFormatNode extends SerializableInputsNode<
  "JsonSchemaFormat",
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
      onChange: () => dataflow.reset(this.id),
    };
    this.addInputPort([
      {
        key: "name",
        typeName: "string",
        label: "name",
        showControl: true,
        control: new InputValueControl<string>({
          value: "",
          type: "string",
          label: "name",
          ...opts,
        }),
      },
      {
        key: "schema",
        typeName: "object",
        label: "schema",
      },
      {
        key: "description",
        typeName: "string",
        label: "description",
        showControl: true,
        control: new InputValueControl<string>({
          value: "",
          type: "string",
          label: "description",
          ...opts,
        }),
      },
      {
        key: "strict",
        typeName: "boolean",
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
      typeName: "JsonSchemaFormat",
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
          name: this.getInputValue(inputs, "name"),
          description: this.getInputValue(inputs, "description"),
          strict: this.getInputValue(inputs, "strict"),
        },
        schema: schema as Record<string, unknown>,
      },
    } as { out: JsonSchemaFormat };
  }

  async execute(): Promise<void> {}
}
