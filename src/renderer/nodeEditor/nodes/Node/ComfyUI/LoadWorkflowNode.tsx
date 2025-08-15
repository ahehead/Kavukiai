import { electronApiService } from 'renderer/features/services/appService'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import {
  type AreaExtra,
  NodeStatus,
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'

import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import { ConsoleControl } from '../../Controls/Console'

export class LoadWorkflowNode extends SerializableInputsNode<
  'LoadWorkflow',
  { exec: TypedSocket; endpoint: TypedSocket; workflowRef: TypedSocket },
  { exec: TypedSocket; workflow: TypedSocket },
  { console: ConsoleControl }
> {
  private lastWorkflow: unknown = null

  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('LoadWorkflow')
    this.addInputPort([
      {
        key: 'exec',
        typeName: 'exec',
        label: 'Run',
        onClick: () => this.controlflow.execute(this.id, 'exec'),
      },
      {
        key: 'endpoint',
        typeName: 'string',
        label: 'endpoint',
        require: true,
      },
      {
        key: 'workflowRef',
        typeName: 'object',
        label: 'WorkflowRef',
        require: true,
      },
    ])
    this.addOutputPort([
      { key: 'exec', typeName: 'exec', label: 'Out' },
      { key: 'workflow', typeName: 'object', label: 'Workflow' },
    ])
    this.addControl('console', new ConsoleControl({ isOpen: true }))
  }

  data(): { workflow: unknown } {
    return { workflow: this.lastWorkflow }
  }

  async execute(_: never, forward: (output: 'exec') => void): Promise<void> {
    if (this.status === NodeStatus.RUNNING) return
    this.changeStatus(this.area, NodeStatus.RUNNING)

    const inputs = await this.dataflow.fetchInputs(this.id)
    const endpoint = this.getInputValue<string>(inputs, 'endpoint')
    const workflowRef = this.getInputValue<any>(inputs, 'workflowRef')

    if (!endpoint) {
      this.changeStatus(this.area, NodeStatus.ERROR)
      this.controls.console.addValue('Error: endpoint is empty')
      return
    }
    if (!workflowRef) {
      this.changeStatus(this.area, NodeStatus.ERROR)
      this.controls.console.addValue('Error: workflowRef is empty')
      return
    }

    try {
      const data = await electronApiService.readWorkflowRef({
        endpoint,
        workflowRef,
      })
      this.lastWorkflow = data
      this.controls.console.addValue('Loaded workflow via workflowRef')
      this.changeStatus(this.area, NodeStatus.COMPLETED)
      this.dataflow.reset(this.id)
      forward('exec')
    } catch (e: any) {
      this.changeStatus(this.area, NodeStatus.ERROR)
      this.controls.console.addValue(`Error: ${e?.message ?? String(e)}`)
    }
  }
}
