import type { ConnectionParams, DynamicSchemaNode } from "renderer/nodeEditor/types/Node/DynamicSchemaNode";
import type { HistoryPlugin } from 'rete-history-plugin';
import type { AreaPlugin } from 'rete-area-plugin';
import type { DataflowEngine } from 'rete-engine';
import { BaseNode } from "renderer/nodeEditor/types/Node/BaseNode";
import type { TypedSocket, Schemes, AreaExtra } from 'renderer/nodeEditor/types';
import { InputValueControl } from '../../Controls/input/InputValue';
import { SwitchControl } from '../../Controls/input/Switch';
import { Type, type TSchema } from '@sinclair/typebox';
import { resetCacheDataflow } from '../../util/resetCacheDataflow';

export class ObjectInputNode extends BaseNode<
  { schema: TypedSocket } & Record<string, TypedSocket>,
  { out: TypedSocket },
  object
> implements DynamicSchemaNode {
  constructor(
    private history: HistoryPlugin<Schemes>,
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>
  ) {
    super('ObjectInput');

    this.addInputPort({
      key: 'schema',
      name: 'object',
      schema: Type.Object({}),
      label: 'schema',
    });

    this.addOutputPort({
      key: 'out',
      name: 'object',
      schema: Type.Object({}),
    });
  }

  async onConnectionChangedSchema({ target }: ConnectionParams): Promise<string[]> {
    if (target !== this.inputs.schema?.socket) return [];
    resetCacheDataflow(this.dataflow, this.id);
    await this.setupSchema();
    await this.area.update('node', this.id);
    return ['out'];
  }

  async setupSchema(): Promise<void> {
    const schema = this.inputs.schema?.socket.getSchema();
    const props = (schema as any)?.properties as Record<string, TSchema> | undefined;

    for (const key of Object.keys(this.inputs)) {
      if (key !== 'schema') {
        this.removeInput(key as never);
      }
    }

    let outSchema: TSchema = Type.Object({});
    if (props) {
      outSchema = Type.Object(props);
      for (const [key, propSchema] of Object.entries(props)) {
        const typeName = this.getTypeName(propSchema);
        this.addInputPort({
          key: key as string,
          name: typeName,
          schema: propSchema,
          label: key,
          showControl: true,
          control: this.createControl(typeName),
        });
      }
    }
    await this.outputs.out?.socket.setSchema('object', outSchema);
  }

  private getTypeName(schema: TSchema): string {
    const t = (schema as any).type;
    if (t === 'string') return 'string';
    if (t === 'number' || t === 'integer') return 'number';
    if (t === 'boolean') return 'boolean';
    return 'any';
  }

  private createControl(typeName: string) {
    const opts = {
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

  data(): { out: Record<string, unknown> } {
    const result: Record<string, unknown> = {};
    for (const [key, input] of Object.entries(this.inputs)) {
      if (key === 'schema') continue;
      const value = input?.control && (input.control as any).getValue();
      result[key] = value;
    }
    return { out: result };
  }

  async execute(): Promise<void> {}
}
