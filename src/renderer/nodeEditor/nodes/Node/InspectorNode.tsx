import { type TSchema, Type } from '@sinclair/typebox'
import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import type {
  ConnectionParams,
  DynamicSchemaNode,
} from 'renderer/nodeEditor/types/Node/DynamicSchemaNode'
import { SerializableInputsNode } from 'renderer/nodeEditor/types/Node/SerializableInputsNode'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine, DataflowEngine } from 'rete-engine'
import { MultiLineControl } from '../Controls/input/MultiLine'
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
    { view: MultiLineControl }
  >
  implements DynamicSchemaNode {
  constructor(
    private dataflow: DataflowEngine<Schemes>,
    private area: AreaPlugin<Schemes, AreaExtra>,
    public controlflow: ControlFlowEngine<Schemes>
  ) {
    super('Inspector')
    this.addInputPortPattern({
      type: 'RunButton',
      controlflow: this.controlflow,
    })

    this.addInputPort([
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

    this.addControlByKey({
      key: 'view',
      control: new MultiLineControl({ value: '', editable: false }),
    })
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
    const { inputAny } = (await this.dataflow.fetchInputs(this.id)) as {
      inputAny?: any[]
    }

    // inputがundefinedの場合は何もしない
    if (!inputAny) return

    this.controls.view.setValue(formatValue(inputAny[0]))

    await this.area.update('control', this.controls.view.id)

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
