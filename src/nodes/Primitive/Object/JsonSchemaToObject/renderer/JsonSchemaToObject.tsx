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
import { InputValueControl } from 'renderer/nodeEditor/nodes/Controls/input/InputValue'
import { SwitchControl } from 'renderer/nodeEditor/nodes/Controls/input/Switch'
import { removeConnectionsFromInput } from 'renderer/nodeEditor/nodes/util/removeNode'

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
    const schema = await this.dataflow.fetchInputSingle<TSchema>(this.id, 'schema')
    this.dataflow.reset(this.id)
    if (!schema) {
      this.setSchema(null)
      await this.removeDynamicPorts()
      await this.outputs.out?.socket.setSchema('object', Type.Object({}))
      await this.area.update('node', this.id)
      return
    }

    const restoredSchema = restoreKind(schema)
    this.setSchema(restoredSchema)
    await this.buildDynamicPorts(restoredSchema)
  }

  // 動的なinputを削除
  async removeDynamicPorts(): Promise<void> {
    for (const [key, _tooltip] of this.getDynamicInputs()) {
      await removeConnectionsFromInput(this.editor, this.id, key)
      this.removeInput(key)
    }
  }

  // スキーマから動的なポートを作成
  async buildDynamicPorts(schema: TSchema) {
    await this.syncDynamicPorts(schema)
  }

  // スキーマのプロパティから動的なinputを作成
  addDynamicInput(TSchemaProperties: Record<string, TSchema>) {
    const requiredKeys = this.getRequiredKeySet(this.schema)
    for (const [key, schema] of Object.entries(TSchemaProperties)) {
      const typeName = this.getTypeName(schema)
      this.addInputPort({
        key,
        typeName,
        schema,
        label: key,
        showControl: true,
        control: this.createControl(key, typeName),
        require: requiredKeys.has(key),
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
    const currentSchema = this.schema
    const requiredKeys = this.getRequiredKeySet(currentSchema)
    const properties = this.getSchemaProperties(currentSchema)
    for (const [key, _tooltip] of this.getDynamicInputs()) {
      const value = this.getInputValue(inputs, key)
      if (value !== null) {
        result[key] = value
        continue
      }

      if (!requiredKeys.has(key)) {
        continue
      }

      const propertySchema = properties[key]
      if (!propertySchema) {
        continue
      }

      const fallback = this.getDefaultValueForSchemaProperty(propertySchema)
      if (fallback !== undefined) {
        result[key] = fallback
      }
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
      await this.removeDynamicPorts()
      await this.outputs.out?.socket.setSchema('object', Type.Object({}))
      await this.area.update('node', this.id)
      return
    }
    const typebox = restoreKind(data.schema)
    // console.log('Deserializing schema:', typebox);
    this.setSchema(typebox)
    await this.buildDynamicPorts(typebox)
  }

  private getSchemaProperties(schema: TSchema | null): Record<string, TSchema> {
    if (!schema || typeof (schema as any).properties !== 'object') {
      return {}
    }
    return (schema.properties ?? {}) as Record<string, TSchema>
  }

  private getRequiredKeySet(schema: TSchema | null): Set<string> {
    const required = (schema as any)?.required
    if (!Array.isArray(required)) {
      return new Set<string>()
    }
    return new Set<string>(required as string[])
  }

  private async syncDynamicPorts(schema: TSchema): Promise<void> {
    const properties = this.getSchemaProperties(schema)
    const requiredKeys = this.getRequiredKeySet(schema)
    const desiredEntries = new Map(
      Object.entries(properties).map(([key, propertySchema]) => [
        key,
        {
          schema: propertySchema,
          typeName: this.getTypeName(propertySchema),
        },
      ])
    )

    for (const [key, _tooltip] of this.getDynamicInputs()) {
      const input = this.inputs[key]
      if (!input) continue
      const desired = desiredEntries.get(key)
      if (!desired) {
        await removeConnectionsFromInput(this.editor, this.id, key)
        this.removeInput(key)
        continue
      }

      const currentType = input.socket.getName()
      if (currentType !== desired.typeName) {
        await removeConnectionsFromInput(this.editor, this.id, key)
        this.removeInput(key)
        continue
      }

      input.require = requiredKeys.has(key)
      await input.socket.setSchema(desired.typeName, desired.schema)
      desiredEntries.delete(key)
    }

    const propsToAdd: Record<string, TSchema> = {}
    for (const [key, { schema: propertySchema }] of desiredEntries) {
      propsToAdd[key] = propertySchema
    }

    if (Object.keys(propsToAdd).length > 0) {
      this.addDynamicInput(propsToAdd)
    }

    const outSchema = Object.keys(properties).length > 0 ? schema : Type.Object({})
    await this.outputs.out?.socket.setSchema('object', outSchema)
    await this.area.update('node', this.id)
  }

  private getDefaultValueForSchemaProperty(schema: TSchema): unknown {
    if ('default' in (schema as any)) {
      return (schema as any).default
    }

    const type = (schema as any).type
    switch (type) {
      case 'string':
        return ''
      case 'number':
      case 'integer':
        return 0
      case 'boolean':
        return false
      case 'array':
        return []
      case 'object':
        return {}
      case 'null':
        return null
      default:
        return null
    }
  }
}
