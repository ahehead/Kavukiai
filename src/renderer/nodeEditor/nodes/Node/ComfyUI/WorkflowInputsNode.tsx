import { type TSchema, Type } from '@sinclair/typebox'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import {
  type AreaExtra,
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import type { HistoryPlugin } from 'rete-history-plugin'
import type { WorkflowInputs } from 'shared/ComfyUIType'
import type { ControlJson } from 'shared/JsonType'
import {
  WorkflowIOSelectControl,
  type WorkflowIOSelectValue,
} from '../../Controls/ComfyUI/WorkflowIOSelectControl'

export class WorkflowInputsNode extends SerializableInputsNode<
  'WorkflowInputs',
  { exec: TypedSocket; workflow: TypedSocket },
  { keyPath: TypedSocket; schema: TypedSocket },
  { select: WorkflowIOSelectControl }
> {
  constructor(
    private history: HistoryPlugin<Schemes>,
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('WorkflowInputs')

    this.addInputPort([
      {
        key: 'exec',
        typeName: 'exec',
        label: 'Create',
        onClick: () => this.controlflow.execute(this.id, 'exec'),
      },
      {
        key: 'workflow',
        typeName: 'object',
        label: 'Workflow',
      },
    ])
    this.addOutputPort([
      { key: 'keyPath', typeName: 'WorkflowInputs', label: 'Key/Path/Default' },
      { key: 'schema', typeName: 'JsonSchema', label: 'Schema' },
    ])

    const control = new WorkflowIOSelectControl({
      mode: 'inputs',
      editable: true,
      history: this.history,
      area: this.area,
      filters: { primitiveInputsOnly: true },
      onChange: value => {
        this.changeSchema(value)
        this.dataflow.reset(this.id)
      },
    })
    this.addControl('select', control)
  }

  private buildSchemaFromValue(value: WorkflowIOSelectValue): TSchema {
    const props: Record<string, TSchema> = {}
    for (const sel of value.selections) {
      const t = sel.type
      if (t === 'boolean') props[sel.key] = Type.Boolean()
      else if (t === 'number') props[sel.key] = Type.Number()
      else props[sel.key] = Type.String()
    }
    return Type.Object(props)
  }

  data(_inputs: Record<string, unknown>): {
    keyPath: WorkflowInputs
    schema: TSchema
  } {
    const value = this.controls.select.getValue()

    const keyPath: WorkflowInputs = {}
    for (const sel of value.selections) {
      keyPath[sel.key] = { path: sel.path, default: sel.default }
    }

    const schema = this.buildSchemaFromValue(value)
    this.outputs.schema?.socket.setSchema('JsonSchema', schema)

    return { keyPath, schema }
  }

  changeSchema(value: WorkflowIOSelectValue): void {
    this.outputs.schema?.socket.setSchema(
      'JsonSchema',
      this.buildSchemaFromValue(value)
    )
  }

  async execute(_inputs: 'exec') {
    const workflow = await this.dataflow.fetchInputSingle<object>(
      this.id,
      'workflow'
    )
    this.controls.select.setWorkflow(workflow)
  }

  serializeControlValue(): ControlJson {
    return this.controls.select.toJSON()
  }

  deserializeControlValue(data: any): void {
    this.controls.select.setFromJSON({ data })
  }
}
