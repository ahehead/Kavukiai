import { type TSchema, Type } from '@sinclair/typebox'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { restoreKind } from 'renderer/nodeEditor/nodes/util/restoreKind'
import {
  type AreaExtra,
  type Schemes,
  SerializableInputsNode,
  type TooltipInput,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import type { SerializableDataNode } from 'renderer/nodeEditor/types/Node/SerializableDataNode'

import type { defaultNodeSchemas } from 'renderer/nodeEditor/types/Schemas/DefaultSchema'
import type { NodeEditor } from 'rete'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import type { HistoryPlugin } from 'rete-history-plugin'
import { InputValueControl } from '../../../Controls/input/InputValue'
import { SwitchControl } from '../../../Controls/input/Switch'
import { removeLinkedSockets } from '../../../util/removeNode'

export class JsonSchemaToObjectNode
  extends SerializableInputsNode<
    'JsonSchemaToObject',
    { exec: TypedSocket; schema: TypedSocket } & Record<string, TypedSocket>,
    { out: TypedSocket },
    object
  >
  implements SerializableDataNode {
  schema: TSchema | null = null

  constructor(
    private editor: NodeEditor<Schemes>,
    private history: HistoryPlugin<Schemes>,
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('JsonSchemaToObject')
    this.width = 230

    this.addInputPort([
      {
        key: 'exec',
        label: 'Generate',
        onClick: async () => {
          this.controlflow.execute(this.id, 'exec')
          this.clearSize()
        },
      },
      {
        key: 'schema',
        typeName: 'JsonSchema',
        label: 'schema',
      },
    ])

    this.addOutputPort({
      key: 'out',
      typeName: 'object',
    })
  }

  setSchema(schema: TSchema | null) {
    this.schema = schema
  }

  getSchema(): TSchema | null {
    return this.schema
  }

  getDynamicInputs(): [string, TooltipInput<TypedSocket> | undefined][] {
    return Object.entries(this.inputs).filter(
      ([key]) => !['schema', 'exec'].includes(key)
    )
  }

  // トリガーで実行
  async execute(): Promise<void> {
    // スキーマを取得
    const { schema } = (await this.dataflow.fetchInputs(this.id)) as {
      schema?: TSchema[]
    }
    this.dataflow.reset(this.id)
    await this.removeDynamicPorts()
    if (!schema || schema.length === 0 || !schema?.[0]) {
      this.setSchema(null)
      return
    }
    this.setSchema(schema[0])
    await this.buildDynamicPorts(schema[0])
  }

  // 動的なinputを削除
  async removeDynamicPorts(): Promise<void> {
    for (const [key, _tooltip] of this.getDynamicInputs()) {
      await removeLinkedSockets(this.editor, this.id, key)
      this.removeInput(key)
    }
  }

  // スキーマから動的なポートを作成
  async buildDynamicPorts(schema: TSchema) {
    const props = schema.properties as Record<string, TSchema> | undefined
    let outSchema: TSchema = Type.Object({})
    if (props) {
      outSchema = schema
      this.addDynamicInput(props)
    }
    await this.outputs.out?.socket.setSchema('object', outSchema)
    await this.area.update('node', this.id)
  }

  // スキーマのプロパティから動的なinputを作成
  addDynamicInput(TSchemaProperties: Record<string, TSchema>) {
    for (const [key, schema] of Object.entries(TSchemaProperties)) {
      const typeName = this.getTypeName(schema)
      this.addInputPort({
        key,
        typeName,
        label: key,
        showControl: true,
        control: this.createControl(key, typeName),
      })
    }
  }

  // スキーマのtypeからコントロールのタイプを決定
  private getTypeName(schema: TSchema): keyof typeof defaultNodeSchemas {
    const t = (schema as any).type
    if (t === 'string') return 'string'
    if (t === 'number' || t === 'integer') return 'number'
    if (t === 'boolean') return 'boolean'
    return 'any'
  }

  // コントロールを作成
  private createControl(label: string, typeName: string) {
    const opts = {
      label,
      history: this.history,
      area: this.area,
      editable: true,
      onChange: () => this.dataflow.reset(this.id),
    }
    if (typeName === 'boolean') {
      return new SwitchControl({ value: false, ...opts })
    }
    if (typeName === 'number') {
      return new InputValueControl<number>({
        value: 0,
        type: 'number',
        ...opts,
      })
    }
    return new InputValueControl<string>({ value: '', type: 'string', ...opts })
  }

  // 動的なinputからobjectを作り返す
  data(inputs: Record<string, unknown[]>): { out: Record<string, unknown> } {
    const result: Record<string, unknown> = {}
    for (const [key, _tooltip] of this.getDynamicInputs()) {
      result[key] = this.getInputValue(inputs, key)
    }
    return { out: result }
  }

  serializeControlValue(): { data: { schema: TSchema | null } } {
    return { data: { schema: this.schema } }
  }

  async deserializeControlValue(data: {
    schema: TSchema | null
  }): Promise<void> {
    if (!data.schema) {
      this.setSchema(null)
      return
    }
    const typebox = restoreKind(data.schema)
    // console.log('Deserializing schema:', typebox);
    this.setSchema(typebox)
    await this.removeDynamicPorts()
    await this.buildDynamicPorts(typebox)
  }
}
