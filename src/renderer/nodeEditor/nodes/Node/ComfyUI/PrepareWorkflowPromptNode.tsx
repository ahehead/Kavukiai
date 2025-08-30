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
import { ConsoleControl } from '../../Controls/Console/Console'

/**
 * PrepareWorkflowPromptNode
 * workflowRef (userData/template) を解決し、API 用 prompt/workflow データ(正規化済)を取得する。
 */
export class PrepareWorkflowPromptNode extends SerializableInputsNode<
  'PrepareWorkflowPrompt',
  { exec: TypedSocket; endpoint: TypedSocket; workflowRef: TypedSocket },
  { exec: TypedSocket; workflowPrompt: TypedSocket },
  { console: ConsoleControl }
> {
  private lastWorkflowPrompt: unknown = null

  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('PrepareWorkflowPrompt')
    this.addInputPort([
      {
        key: 'exec',
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
      { key: 'workflowPrompt', typeName: 'object', label: 'WorkflowPrompt' },
    ])
    this.addControl('console', new ConsoleControl({ isOpen: true }))
  }

  data(): { workflowPrompt: unknown } {
    return { workflowPrompt: this.lastWorkflowPrompt }
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
      this.lastWorkflowPrompt = data
      this.controls.console.addValue('Resolved workflowRef to API prompt')
      this.changeStatus(this.area, NodeStatus.COMPLETED)
      this.dataflow.reset(this.id)
      forward('exec')
    } catch (e: any) {
      this.changeStatus(this.area, NodeStatus.ERROR)
      this.controls.console.addValue(`Error: ${e?.message ?? String(e)}`)
    }
  }
}
