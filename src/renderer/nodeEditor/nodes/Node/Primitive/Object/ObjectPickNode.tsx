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

// ObjectPickNode: オブジェクトの各キーを個別の出力として返す
export class ObjectPickNode
  extends SerializableInputsNode<
    'ObjectPick',
    { obj: TypedSocket },
    Record<string, TypedSocket>,
    object
  >
  implements DynamicSchemaNode {
  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>
  ) {
    super('ObjectPick')

    this.addInputPort({
      key: 'obj',
      typeName: 'object',
      label: 'object',
      tooltip: '対象オブジェクト',
    })
  }

  async onConnectionChangedSchema({
    isConnected,
    source,
  }: ConnectionParams): Promise<string[]> {
    this.dataflow.reset(this.id)
    if (isConnected) {
      await this.inputs.obj?.socket.setSchema(
        source.getName(),
        source.getSchema()
      )
    } else {
      await this.inputs.obj?.socket.setSchema('object', Type.Object({}))
    }
    await this.setupSchema()
    await this.area.update('node', this.id)

    return []
  }

  async setupSchema(): Promise<void> {
    await this.updateOutputs(this.inputs.obj?.socket.getSchema())
  }

  private async updateOutputs(schema: TSchema | undefined): Promise<void> {
    for (const key of Object.keys(this.outputs)) {
      this.removeOutput(key as never)
    }
    if (schema && (schema as any).properties) {
      const props = (schema as any).properties as Record<string, TSchema>
      for (const [key, propSchema] of Object.entries(props)) {
        this.addOutputPort({
          key: key,
          typeName: key,
          schema: propSchema,
          label: key,
        })
      }
    }
  }

  data(inputs: { obj?: Record<string, unknown>[] }): Record<string, unknown> {
    const value = inputs.obj?.[0]
    if (!value || typeof value !== 'object') return {}
    return { ...value }
  }

}
