import type { HistoryPlugin } from 'rete-history-plugin';
import type { AreaPlugin } from 'rete-area-plugin';
import type { DataflowEngine } from 'rete-engine';
import { BaseNode } from 'renderer/nodeEditor/types/Node/BaseNode';
import type { TypedSocket, Schemes, AreaExtra } from 'renderer/nodeEditor/types';
import { PropertyInputControl, type PropertyItem } from '../../../Controls/input/PropertyInput';
import { Type, type TSchema } from '@sinclair/typebox';
import { defaultNodeSchemas } from 'renderer/nodeEditor/types/Schemas/DefaultSchema';
import { resetCacheDataflow } from '../../../util/resetCacheDataflow';
import type { SerializableDataNode } from 'renderer/nodeEditor/types/Node/SerializableDataNode';

// Node to build TSchema objects from property list
export class JsonSchemaNode extends BaseNode<
  object,
  { out: TypedSocket },
  { props: PropertyInputControl }
> implements SerializableDataNode {
  constructor(
    history: HistoryPlugin<Schemes>,
    private area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super('JsonSchema');

    this.addOutputPort({
      key: 'out',
      typeName: 'JsonSchema',
    });

    this.addControl(
      'props',
      new PropertyInputControl({
        value: [],
        editable: true,
        history,
        area,
        onChange: () => {
          resetCacheDataflow(dataflow, this.id);
          this.setSchema(this.createSchema());
          this.area.update("node", this.id);
        },
      })
    );
  }

  setSchema(schema: TSchema) {
    this.outputs.out?.socket.setSchema("object", schema);
  }

  data(): { out: TSchema } {
    return { out: this.createSchema() };
  }

  createSchema(): TSchema {
    const items = this.controls.props.getValue();
    const props: Record<string, TSchema> = {};
    for (const item of items) {
      props[item.key] = defaultNodeSchemas[item.typeStr];
    }
    return Type.Object(props);
  }

  async execute(): Promise<void> { }

  serializeControlValue(): { data: { items: PropertyItem[] } } {
    return { data: { items: this.controls.props.getValue() } };
  }

  deserializeControlValue(data: { items: PropertyItem[] }): void {
    this.controls.props.setValue(data.items);
    this.setSchema(this.createSchema());
  }
}
