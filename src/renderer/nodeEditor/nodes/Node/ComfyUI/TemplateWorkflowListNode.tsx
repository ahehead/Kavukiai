import { electronApiService } from 'renderer/features/services/appService'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import type { Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { SerializableInputsNode } from 'renderer/nodeEditor/types/Node/SerializableInputsNode'
import type { ControlFlowEngine } from 'rete-engine'
import type { HistoryPlugin } from 'rete-history-plugin'
import { SelectWorkflowControl } from '../../Controls/ComfyUI/SelectWorkflowControl'

export class TemplateWorkflowListNode extends SerializableInputsNode<
  'TemplateWorkflowList',
  { exec: TypedSocket; endpoint: TypedSocket },
  { workflowRef: TypedSocket },
  { select: SelectWorkflowControl }
> {
  constructor(
    history: HistoryPlugin<Schemes>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('TemplateWorkflowList')
    this.addInputPort([
      {
        key: 'exec',
        label: 'Refresh',
        onClick: () => this.controlflow.execute(this.id),
      },
      {
        key: 'endpoint',
        typeName: 'string',
        label: 'Endpoint',
      }])
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
    const endpoint = await this.dataflow.fetchInputSingle<string>(
      this.id,
      'endpoint'
    )
    console.log('TemplateWorkflowListNode execute', endpoint)
    if (!endpoint) {
      await this.controls.select.setItems([])
      this.controls.select.setError('Endpoint is required')
      return
    }
    this.controls.select.setLoading()
    try {
      const list = await electronApiService.listTemplateWorkflows(endpoint)
      await this.controls.select.setItems(list)
      // 成功時はエラークリア
      this.controls.select.setError('')
    } catch (e: any) {
      console.error('Error fetching template workflows:', e)
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
