import { type TSchema, Type } from '@sinclair/typebox'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import {
  type AreaExtra,
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import type {
  ConnectionParams,
  DynamicSchemaNode,
} from 'renderer/nodeEditor/types/Node/DynamicSchemaNode'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import { InspectorViewControl } from '../Controls/Console/InspectorView'
import { formatValue } from '../util/formatValue'

// View String ノード
export class InspectorNode
  extends SerializableInputsNode<
    'Inspector',
    {
      exec: TypedSocket
      inputAny: TypedSocket
    },
    {
      exec: TypedSocket
      outputAny: TypedSocket
    },
    { view: InspectorViewControl }
  >
  implements DynamicSchemaNode {
  constructor(
    private dataflow: DataflowEngine<Schemes>,
    private area: AreaPlugin<Schemes, AreaExtra>,
    public controlflow: ControlFlowEngine<Schemes>
  ) {
    super('Inspector')
    this.width = 230
    this.height = 250

    this.addInputPort([
      {
        key: 'exec',
        label: 'scan',
        onClick: async () => this.controlflow.execute(this.id, 'exec'),
      },
      {
        key: 'inputAny',
        typeName: 'any',
        tooltip: '表示するデータ',
      },
    ])

    this.addOutputPort([
      {
        key: 'exec',
        typeName: 'exec',
      },
      {
        key: 'outputAny',
        typeName: 'any',
      },
    ])

    this.addControl('view', new InspectorViewControl({ value: '' }))
  }

  data(inputs: { inputAny?: any[] }): { outputAny: any | undefined } {
    const value = inputs.inputAny?.[0] || undefined
    return { outputAny: value }
  }

  // 実行時、inputを取得して表示する
  async execute(
    _input: 'exec',
    forward: (output: 'exec') => void
  ): Promise<void> {
    const inputAny = await this.dataflow.fetchInputSingle<any>(
      this.id,
      'inputAny'
    )
    if (inputAny === null) return
    this.controls.view.setValue(formatValue(inputAny))
    forward('exec')
  }

  async onConnectionChangedSchema({
    isConnected,
    source,
  }: ConnectionParams): Promise<string[]> {
    if (isConnected) {
      await this.updateSchema(source.getName(), source.getSchema())
    } else {
      await this.updateSchema('any', Type.Any())
    }
    await this.area.update('node', this.id)
    return ['outputAny']
  }

  async setupSchema(): Promise<void> {
    // 特に何もしない
  }

  public async updateSchema(
    schemaName: string,
    schema: TSchema
  ): Promise<void> {
    await this.inputs.inputAny?.socket.setSchema(schemaName, schema)
    await this.outputs.outputAny?.socket.setSchema(schemaName, schema)
  }
}
