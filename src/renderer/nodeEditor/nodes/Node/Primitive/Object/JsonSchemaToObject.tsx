
import type { HistoryPlugin } from 'rete-history-plugin';
import type { AreaPlugin } from 'rete-area-plugin';
import type { ControlFlowEngine, DataflowEngine } from 'rete-engine';
import type { TypedSocket, Schemes, AreaExtra } from 'renderer/nodeEditor/types';
import { InputValueControl } from '../../../Controls/input/InputValue';
import { SwitchControl } from '../../../Controls/input/Switch';
import { Type, type TSchema } from '@sinclair/typebox';
import { resetCacheDataflow } from '../../../util/resetCacheDataflow';
import { SerializableInputsNode } from "renderer/nodeEditor/types/Node/SerializableInputsNode";
import { ButtonControl } from '../../../Controls/Button';
import type { SerializableDataNode } from 'renderer/nodeEditor/types/Node/SerializableDataNode';
import { getInputValue } from '../../../util/getInput';
import { removeLinkedSockets } from '../../../util/removeNode';
import type { NodeEditor } from 'rete';
import { Value } from '@sinclair/typebox/value';
import type { defaultNodeSchemas } from 'renderer/nodeEditor/types/Schemas/DefaultSchema';

export class JsonSchemaToObjectNode extends SerializableInputsNode<
  { exec: TypedSocket; schema: TypedSocket } & Record<string, TypedSocket>,
  { out: TypedSocket },
  object
> implements SerializableDataNode {
  schema: TSchema | null = null;
  constructor(
    private editor: NodeEditor<Schemes>,
    private history: HistoryPlugin<Schemes>,
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('JsonSchemaToObject');

    this.addInputPort([{
      key: "exec",
      typeName: "exec",
      label: 'create',
      showControl: true,
      control: new ButtonControl({
        label: 'Create',
        onClick: async (e) => {
          e.stopPropagation();
          this.controlflow.execute(this.id, "exec");
        },
      })
    }, {
      key: 'schema',
      typeName: 'JsonSchema',
      label: 'schema',
    }]);

    this.addOutputPort({
      key: 'out',
      typeName: 'object',
    });
  }

  setSchema(schema: TSchema | null) {
    this.schema = schema;
  }

  async execute(): Promise<void> {
    const { schema } = (await this.dataflow.fetchInputs(this.id)) as { schema?: TSchema[] }
    resetCacheDataflow(this.dataflow, this.id);
    await this.removeDynamicPorts();
    if (!schema?.[0]) {
      this.setSchema(null);
      return;
    }
    this.setSchema(schema[0]);
    await this.buildDynamicPorts(schema[0]);

  }

  async buildDynamicPorts(schema: TSchema) {
    const props = schema.properties as Record<string, TSchema> | undefined;
    let outSchema: TSchema = Type.Object({});
    if (props) {
      outSchema = schema;
      this.addDynamicInput(props);
    }
    await this.outputs.out?.socket.setSchema('object', outSchema);
    await this.area.update('node', this.id);
  }


  async removeDynamicPorts(): Promise<void> {
    for (const key of Object.keys(this.inputs).filter(key => !["schema", "exec"].includes(key))) {
      await removeLinkedSockets(this.editor, this.id, key);
      this.removeInput(key as never);
    }
  }

  addDynamicInput(TSchemaProperties: Record<string, TSchema>) {
    for (const [key, schema] of Object.entries(TSchemaProperties)) {
      const typeName = this.getTypeName(schema);
      this.addInputPort({
        key,
        typeName,
        label: key,
        showControl: true,
        control: this.createControl(key, typeName),
      });
    }
  }

  private getTypeName(schema: TSchema): keyof typeof defaultNodeSchemas {
    const t = (schema as any).type;
    if (t === 'string') return 'string';
    if (t === 'number' || t === 'integer') return 'number';
    if (t === 'boolean') return 'boolean';
    return 'any';
  }

  private createControl(label: string, typeName: string) {
    const opts = {
      label,
      history: this.history,
      area: this.area,
      editable: true,
      onChange: () => resetCacheDataflow(this.dataflow, this.id),
    };
    if (typeName === 'boolean') {
      return new SwitchControl({ value: false, ...opts });
    }
    if (typeName === 'number') {
      return new InputValueControl<number>({ value: 0, type: 'number', ...opts });
    }
    return new InputValueControl<string>({ value: '', type: 'string', ...opts });
  }

  data(inputs: Record<string, unknown>): { out: Record<string, unknown> } {
    const result: Record<string, unknown> = {};
    for (const [key, input] of Object.entries(this.inputs)) {
      if (key === 'schema' || key === 'exec') continue;
      const value = getInputValue(this.inputs, key, inputs);
      result[key] = value;
    }
    return { out: result };
  }

  serializeControlValue(): { data: { schema: TSchema | null } } {
    return { data: { schema: this.schema } };
  }

  async deserializeControlValue(data: { schema: TSchema | null }): Promise<void> {
    if (!data.schema || Value.Equal(this.schema, data.schema)) {
      return;
    }

    this.setSchema(data.schema);
    await this.removeDynamicPorts();
    await this.buildDynamicPorts(data.schema);

  }
}
