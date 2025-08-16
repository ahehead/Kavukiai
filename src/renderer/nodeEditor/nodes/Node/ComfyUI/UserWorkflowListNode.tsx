import { electronApiService } from 'renderer/features/services/appService'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import type { Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { SerializableInputsNode } from 'renderer/nodeEditor/types/Node/SerializableInputsNode'
import type { ControlFlowEngine } from 'rete-engine'
import type { HistoryPlugin } from 'rete-history-plugin'
import { SelectWorkflowControl } from '../../Controls/ComfyUI/SelectWorkflowControl'

export class UserWorkflowListNode extends SerializableInputsNode<
  'UserWorkflowList',
  { exec: TypedSocket; endpoint: TypedSocket },
  { workflowRef: TypedSocket },
  { select: SelectWorkflowControl }
> {
  constructor(
    history: HistoryPlugin<Schemes>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('UserWorkflowList')
    this.addInputPort([
      {
        key: 'exec',
        typeName: 'exec',
        label: 'Refresh',
        onClick: () => this.controlflow.execute(this.id),
      },
      {
        key: 'endpoint',
        typeName: 'string',
        label: 'Endpoint',
      }
    ])
    this.addOutputPort({
      key: 'workflowRef',
      typeName: 'WorkflowRef',
      label: 'WorkflowRef',
    })
    this.addControl(
      'select',
      new SelectWorkflowControl({
        history,
        source: 'template',
        onChange: () => this.dataflow.reset(this.id),
      })
    )
  }

  async execute(): Promise<void> {
    // exec 押下でリスト取得
    const endpoint = await this.dataflow.fetchInputSingle<string>(
      this.id,
      'endpoint'
    )
    if (!endpoint) {
      await this.controls.select.setItems([])
      this.controls.select.setError('Endpoint is required')
      return
    }
    this.controls.select.setLoading()
    try {
      const list = await electronApiService.listUserWorkflows(endpoint)
      await this.controls.select.setItems(list)
      this.controls.select.setError('')
    } catch (e: any) {
      await this.controls.select.setItems([])
      this.controls.select.setError(String(e?.message ?? e))
    }
  }

  data(): {
    workflowRef: { source: 'userData' | 'template'; name: string } | null
  } {
    return { workflowRef: this.controls.select.getSelected() }
  }

  serializeControlValue() {
    return this.controls.select.toJSON()
  }
  deserializeControlValue(data: any) {
    this.controls.select.setFromJSON({ data })
  }
}
