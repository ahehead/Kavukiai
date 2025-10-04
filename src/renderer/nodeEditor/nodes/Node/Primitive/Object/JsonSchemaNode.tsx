import { type TSchema, Type } from '@sinclair/typebox'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import {
  type AreaExtra,
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import type { SerializableDataNode } from 'renderer/nodeEditor/types/Node/SerializableDataNode'
import { defaultNodeSchemas } from 'renderer/nodeEditor/types/Schemas/DefaultSchema'
import type { AreaPlugin } from 'rete-area-plugin'
import type { HistoryPlugin } from 'rete-history-plugin'
import {
  PropertyInputControl,
  type PropertyItem,
} from '../../../Controls/input/PropertyInput'

// Node to build TSchema objects from property list
export class JsonSchemaNode
  extends SerializableInputsNode<
    'JsonSchema',
    object,
    { out: TypedSocket },
    { props: PropertyInputControl }
  >
  implements SerializableDataNode {
  constructor(
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super('JsonSchema')
    this.width = 300
    this.height = 180
    this.addOutputPort({
      key: 'out',
      typeName: 'JsonSchema',
    })

    this.addControl(
      'props',
      new PropertyInputControl({
        value: [],
        editable: true,
        history,
        area,
        onChange: () => {
          dataflow.reset(this.id)
          this.setSchema(this.createSchema())
        },
      })
    )
  }

  setSchema(schema: TSchema) {
    this.outputs.out?.socket.setSchema('JsonSchema', schema)
  }

  data(): { out: TSchema } {
    return { out: this.createSchema() }
  }

  createSchema(): TSchema {
    const items = this.controls.props.getValue()
    const props: Record<string, TSchema> = {}
    for (const item of items) {
      const schema = this.createPropertySchema(item)
      props[item.key] = item.required ? schema : Type.Optional(schema)
    }
    return Type.Object(props)
  }

  private createPropertySchema(item: PropertyItem): TSchema {
    switch (item.typeStr) {
      case 'string': {
        const options =
          item.required && typeof item.defaultValue === 'string'
            ? { default: item.defaultValue }
            : undefined
        return Type.String(options)
      }
      case 'number': {
        const options =
          item.required && typeof item.defaultValue === 'number'
            ? { default: item.defaultValue }
            : undefined
        return Type.Number(options)
      }
      case 'boolean': {
        const options =
          item.required && typeof item.defaultValue === 'boolean'
            ? { default: item.defaultValue }
            : undefined
        return Type.Boolean(options)
      }
      default:
        return defaultNodeSchemas[item.typeStr]
    }
  }

  serializeControlValue(): { data: { items: PropertyItem[] } } {
    return { data: { items: this.controls.props.getValue() } }
  }

  deserializeControlValue(data: { items: PropertyItem[] }): void {
    this.controls.props.setValue(data.items)
    this.setSchema(this.createSchema())
  }
}
