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
import {
  WorkflowSelectControl,
  type WorkflowSelectValue,
} from '../../Controls/input/WorkflowSelectControl'

export class WorkflowInputsNode extends SerializableInputsNode<
  'WorkflowInputs',
  { exec: TypedSocket; workflow: TypedSocket },
  { keyPath: TypedSocket; schema: TypedSocket },
  { select: WorkflowSelectControl }
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

    const control = new WorkflowSelectControl({
      editable: true,
      history: this.history,
      area: this.area,
      onChange: value => {
        this.changeSchema(value)
        this.dataflow.reset(this.id)
      },
    })
    this.addControl('select', control)
  }

  private buildSchemaFromValue(value: WorkflowSelectValue): TSchema {
    const props: Record<string, TSchema> = {}
    for (const [key, info] of Object.entries(value.inputs)) {
      const t = info.type
      if (t === 'boolean') props[key] = Type.Boolean()
      else if (t === 'number') props[key] = Type.Number()
      else props[key] = Type.String()
    }
    return Type.Object(props)
  }

  data(_inputs: Record<string, unknown>): {
    keyPath: WorkflowInputs
    schema: TSchema
  } {
    const value = this.controls.select.getValue()

    const keyPath: WorkflowInputs = {}
    for (const [key, info] of Object.entries(value.inputs)) {
      keyPath[key] = { path: info.path, default: info.default }
    }

    const schema = this.buildSchemaFromValue(value)
    this.outputs.schema?.socket.setSchema('JsonSchema', schema)

    return { keyPath, schema }
  }

  changeSchema(value: WorkflowSelectValue): void {
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
    // control に workflow を反映
    this.controls.select.setValue({ workflow, inputs: {} })
  }
}
