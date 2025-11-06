import { type TSchema, Type } from '@sinclair/typebox'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { ArrayViewControl } from 'renderer/nodeEditor/nodes/Controls/view/ArrayViewControl'
import { restoreKind } from 'renderer/nodeEditor/nodes/util/restoreKind'
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
import type { SerializableDataNode } from 'renderer/nodeEditor/types/Node/SerializableDataNode'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'

export class ArrayNode
  extends SerializableInputsNode<
    'Array',
    { exec: TypedSocket; item: TypedSocket },
    { exec: TypedSocket; items: TypedSocket, exec2: TypedSocket },
    { itemsView: ArrayViewControl }
  >
  implements DynamicSchemaNode, SerializableDataNode {
  private schemaName = 'any'
  private schema: TSchema = Type.Any()

  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('Array')

    this.addInputPort([
      {
        key: 'exec',
        label: 'push',
        onClick: () => this.controlflow.execute(this.id, 'exec'),
      },
      {
        key: 'item',
        typeName: 'any',
        label: 'item',
        tooltip: 'push で追加する要素',
      },
      {
        key: "exec2",
        label: "clear",
        onClick: () => this.controlflow.execute(this.id, "exec2")
      }
    ])

    this.addOutputPort([
      { key: 'exec', typeName: 'exec', label: 'pushed' },
      {
        key: 'items',
        typeName: 'array',
        schema: Type.Array(this.schema),
        label: 'items',
      },
      { key: "exec2", typeName: "exec", label: "cleared" }
    ])

    this.addControl(
      'itemsView',
      new ArrayViewControl({
        value: [],
        editable: false,
        onChange: () => this.dataflow.reset(this.id),
      })
    )
  }

  data(): { items: unknown[] } {
    return { items: this.controls.itemsView.getValue() }
  }

  async execute(input: 'exec' | 'exec2', forward: (output: 'exec' | 'exec2') => void): Promise<void> {
    if (input === 'exec') {
      const item = await this.dataflow.fetchInputSingle<any>(this.id, 'item')
      if (item === null || item === undefined) {
        return
      }
      this.controls.itemsView.pushItem(item)
      forward('exec')
    }
    else if (input === 'exec2') {
      this.controls.itemsView.clear()
      forward("exec2")
      return
    }

  }

  async onConnectionChangedSchema({
    isConnected,
    source,
    data
  }: ConnectionParams): Promise<string[]> {
    this.dataflow.reset(this.id)
    if (isConnected) {
      await this.applySchema(source.getName(), source.getSchema())
    } else if (data.targetInput === 'item') {
      await this.applySchema('any', Type.Any())
    }
    await this.area.update('node', this.id)
    return ['items']
  }

  async setupSchema(): Promise<void> {
    await this.applySchema(this.schemaName, this.schema)
  }

  private async applySchema(
    schemaName: string,
    schema: TSchema
  ): Promise<void> {
    await this.inputs.item?.socket.setSchema(schemaName, schema)
    await this.outputs.items?.socket.setSchema(
      `<${schemaName}>Array`,
      Type.Array(schema)
    )
    this.schemaName = schemaName
    this.schema = schema
  }

  serializeControlValue(): {
    data: { items: unknown[]; schemaName: string; schema: TSchema }
  } {
    return {
      data: {
        items: [...this.controls.itemsView.getValue()],
        schemaName: this.schemaName,
        schema: this.schema,
      },
    }
  }

  deserializeControlValue(data: {
    items?: unknown[]
    schemaName?: string
    schema?: TSchema
  }): void {
    const items = Array.isArray(data.items) ? data.items : []
    this.controls.itemsView.setValue(items)
    this.schemaName = data.schemaName ?? 'any'
    this.schema = data.schema ? restoreKind(data.schema) : Type.Any()
  }
}
