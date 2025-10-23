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
import type { WorkflowOutputs } from '@nodes/ComfyUI/common/shared'
import type { ControlJson } from 'shared/JsonType'
import {
  WorkflowIOSelectControl,
  type WorkflowIOSelectValue,
} from '@nodes/ComfyUI/common/renderer/controls/WorkflowIOSelectControl'

export class WorkflowOutputsNode extends SerializableInputsNode<
  'WorkflowOutputs',
  { exec: TypedSocket; workflow: TypedSocket },
  { workflowOutputs: TypedSocket },
  { select: WorkflowIOSelectControl }
> {
  constructor(
    private history: HistoryPlugin<Schemes>,
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('WorkflowOutputs')
    this.width = 380
    this.height = 430
    this.addInputPort([
      {
        key: 'exec',
        label: 'Scan',
        onClick: () => this.controlflow.execute(this.id, 'exec'),
      },
      { key: 'workflow', typeName: 'object', label: 'Workflow(API)' },
    ])
    this.addOutputPort([
      { key: 'workflowOutputs', typeName: 'WorkflowOutputs', label: 'Outputs' },
    ])

    const control = new WorkflowIOSelectControl({
      mode: 'outputs',
      history: this.history,
      area: this.area,
      filters: { leafNodesOnly: true },
      onChange: () => {
        this.dataflow.reset(this.id)
      },
    })
    this.addControl('select', control)
  }

  data(): { workflowOutputs: WorkflowOutputs } {
    const value: WorkflowIOSelectValue = this.controls.select.getValue()
    const out: WorkflowOutputs = {}
    for (const s of value.selections) out[s.key] = { path: s.path }
    return { workflowOutputs: out }
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
