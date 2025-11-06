import type { TSchema } from '@sinclair/typebox'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { MultiLineControl } from 'renderer/nodeEditor/nodes/Controls/input/MultiLine'
import {
  buildTemplateSchema,
  parseTemplatePlaceholders,
} from 'renderer/nodeEditor/nodes/util/templatePlaceholders'
import {
  type AreaExtra,
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import type { AreaPlugin } from 'rete-area-plugin'
import type { HistoryPlugin } from 'rete-history-plugin'

// 長文文字列入力ノード
export class MultiLineStringNode extends SerializableInputsNode<
  'MultiLineString',
  object,
  { out: TypedSocket; schema: TypedSocket },
  { textArea: MultiLineControl }
> {
  private currentSchema: TSchema = buildTemplateSchema([])
  private schemaSignature = ''

  constructor(
    initial: string,
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super('MultiLineString')
    this.width = 240
    this.height = 180
    this.addOutputPort([
      {
        key: 'out',
        typeName: 'string',
      },
      {
        key: 'schema',
        typeName: 'JsonSchema',
        label: 'Schema',
      },
    ])
    this.addControl(
      'textArea',
      new MultiLineControl({
        value: initial,
        history,
        area,
        onChange: (value: string) => {
          this.updateSchema(value)
          dataflow.reset(this.id)
        },
      })
    )

    this.updateSchema(initial)
  }

  data(): { out: string; schema: TSchema } {
    const value = this.controls.textArea.getValue() || ''
    this.updateSchema(value)
    return { out: value, schema: this.currentSchema }
  }

  serializeControlValue(): { data: { value: string } } {
    return {
      data: {
        value: this.controls.textArea.getValue() || '',
      },
    }
  }

  deserializeControlValue(data: { value: string }): void {
    this.controls.textArea.setValue(data.value)
    this.updateSchema(data.value)
  }

  private updateSchema(template: string) {
    const placeholders = parseTemplatePlaceholders(template)
    const signature = placeholders.join('|')
    if (signature === this.schemaSignature) {
      return
    }

    this.schemaSignature = signature
    const schema = buildTemplateSchema(placeholders)
    this.currentSchema = schema
    void this.outputs.schema?.socket.setSchema('JsonSchema', schema)
  }
}
