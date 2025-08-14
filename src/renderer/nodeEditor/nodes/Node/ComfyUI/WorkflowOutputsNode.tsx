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
import type { WorkflowOutputs } from 'shared/ComfyUIType'
import {
  WorkflowIOSelectControl,
  type WorkflowIOSelectValue,
} from '../../Controls/input/WorkflowIOSelectControl'

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

    this.addInputPort([
      {
        key: 'exec',
        typeName: 'exec',
        label: 'Scan',
        onClick: () => this.controlflow.execute(this.id, 'exec'),
      },
      { key: 'workflow', typeName: 'object', label: 'Workflow' },
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
}
