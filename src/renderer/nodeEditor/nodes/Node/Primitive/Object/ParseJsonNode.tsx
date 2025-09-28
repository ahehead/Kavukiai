import { type TSchema, Type } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { removeConnectionsFromOutput } from 'renderer/nodeEditor/nodes/util/removeNode'
import { restoreKind } from 'renderer/nodeEditor/nodes/util/restoreKind'
import {
  type AreaExtra,
  NodeStatus,
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import type { SerializableDataNode } from 'renderer/nodeEditor/types/Node/SerializableDataNode'
import type { NodeEditor } from 'rete'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'

export class ParseJsonNode
  extends SerializableInputsNode<
    'ParseJson',
    { exec: TypedSocket; schema: TypedSocket; value: TypedSocket },
    Record<string, TypedSocket>,
    object
  >
  implements SerializableDataNode {
  private currentSchema: TSchema | null = null

  constructor(
    private editor: NodeEditor<Schemes>,
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('ParseJson')
    this.width = 260

    this.addInputPort([
      {
        key: 'exec',
        label: 'Build',
        onClick: () => this.controlflow.execute(this.id, 'exec'),
      },
      { key: 'schema', typeName: 'JsonSchema', label: 'schema' },
      {
        key: 'value',
        typeName: 'string',
        label: 'value',
      },
    ])
  }

  async dataWithFetch(
    fetchInputs: (keys?: readonly string[]) => Promise<{ value?: string[] }>
  ): Promise<Record<string, unknown>> {
    try {
      if (!this.currentSchema) throw new Error('Schema is not set')
      const { value } = await fetchInputs(['value'])
      const rawValue = value?.[0]
      if (!rawValue) throw new Error('No input value to parse')
      const obj = Value.Parse(this.currentSchema, JSON.parse(rawValue))
      return obj as Record<string, unknown>
    } catch (error) {
      console.error('[ParseJsonNode] Error parsing JSON:', error)
      this.changeStatus(NodeStatus.ERROR)
      return {}
    }
  }

  async execute(_: 'exec', forward: (output: 'exec') => void): Promise<void> {
    if (this.status === NodeStatus.RUNNING) return
    this.changeStatus(NodeStatus.RUNNING)

    try {
      await this.removeOutputKeys()

      const schema = await this.dataflow.fetchInputSingle<TSchema>(
        this.id,
        'schema'
      )
      if (!schema) {
        throw new Error('Schema is required to parse value')
      }
      this.currentSchema = schema
      this.buildOutputs(schema)
      this.area.update("node", this.id)

      this.changeStatus(NodeStatus.COMPLETED)
      forward('exec')
    } catch (error) {
      this.currentSchema = Type.Any()
      this.changeStatus(NodeStatus.ERROR)

      if (error instanceof Error) {
        console.error([ParseJsonNode])
      } else {
        console.error('[ParseJsonNode] Unknown error during parse')
      }
    } finally {
      this.dataflow.reset(this.id)
    }
  }

  async removeOutputKeys() {
    for (const [key, _output] of Object.entries(this.outputs)) {
      await removeConnectionsFromOutput(this.editor, this.id, key)
      this.removeOutput(key)
    }
  }

  buildOutputs(schema: TSchema) {
    const props = schema.properties as Record<string, TSchema> | undefined
    if (props === undefined) return
    for (const [key, schema] of Object.entries(props)) {
      this.addOutputPort({
        key,
        typeName: schema.type, // typeを全面的に信じている
        label: key,
      })
    }
  }

  serializeControlValue(): { data: { schema: TSchema | null } } {
    return {
      data: {
        schema: this.currentSchema,
      },
    }
  }

  async deserializeControlValue(data: {
    schema?: TSchema | null
  }): Promise<void> {
    this.currentSchema = data.schema ? restoreKind(data.schema) : null
    if (this.currentSchema) {
      this.buildOutputs(this.currentSchema)
      await this.area.update('node', this.id)
    }
  }
}
