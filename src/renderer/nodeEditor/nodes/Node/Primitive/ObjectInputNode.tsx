
import type { HistoryPlugin } from 'rete-history-plugin';
import type { AreaPlugin } from 'rete-area-plugin';
import type { ControlFlowEngine, DataflowEngine } from 'rete-engine';
import type { TypedSocket, Schemes, AreaExtra } from 'renderer/nodeEditor/types';
import { InputValueControl } from '../../Controls/input/InputValue';
import { SwitchControl } from '../../Controls/input/Switch';
import { Type, type TSchema } from '@sinclair/typebox';
import { resetCacheDataflow } from '../../util/resetCacheDataflow';
import { SerializableInputsNode } from "renderer/nodeEditor/types/Node/SerializableInputsNode";
import { ButtonControl } from '../../Controls/Button';

export class ObjectInputNode extends SerializableInputsNode<
  { exec: TypedSocket; schema: TypedSocket } & Record<string, TypedSocket>,
  { out: TypedSocket },
  object
> {
  constructor(
    private history: HistoryPlugin<Schemes>,
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('ObjectInput');

    this.addInputPort([{
      key: "exec",
      name: "exec",
      schema: Type.Literal("exec"),
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
      name: 'JsonSchema',
      schema: Type.Object({}),
      label: 'schema',
    }]);

    this.addOutputPort({
      key: 'out',
      name: 'object',
      schema: Type.Object({}),
    });
  }

  async execute(): Promise<void> {
    const { schema } = (await this.dataflow.fetchInputs(this.id)) as { schema?: TSchema[] }
    if (!schema?.[0]) {
      this.clearInputs();
      resetCacheDataflow(this.dataflow, this.id);
      return;
    }
    resetCacheDataflow(this.dataflow, this.id);
    const props = schema[0].properties as Record<string, TSchema> | undefined;
    this.clearInputs();
    let outSchema: TSchema = Type.Object({});
    if (props) {
      outSchema = Type.Object(props);
      this.registerInputs(props);
    }
    await this.outputs.out?.socket.setSchema('object', outSchema);
    await this.area.update('node', this.id);
  }


  clearInputs(): void {
    for (const key of Object.keys(this.inputs).filter(key => !["schema", "exec"].includes(key))) {
      this.removeInput(key as never);
    }
  }

  registerInputs(TSchemaProperties: Record<string, TSchema>) {
    for (const [key, schema] of Object.entries(TSchemaProperties)) {
      const typeName = this.getTypeName(schema);
      this.addInputPort({
        key,
        name: typeName,
        schema,
        label: key,
        showControl: true,
        control: this.createControl(key, typeName),
      });
    }
  }

  private getTypeName(schema: TSchema): string {
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

  data(): { out: Record<string, unknown> } {
    const result: Record<string, unknown> = {};
    for (const [key, input] of Object.entries(this.inputs)) {
      if (key === 'schema' || key === 'exec') continue;
      const value = input?.control && (input.control as any).getValue();
      result[key] = value;
    }
    return { out: result };
  }


}
