import { electronApiService } from 'renderer/features/services/appService'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { SerializableInputsNode } from 'renderer/nodeEditor/types/Node/SerializableInputsNode'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import type { HistoryPlugin } from 'rete-history-plugin'
import { SelectWorkflowControl } from 'renderer/nodeEditor/nodes/Controls/ComfyUI/SelectWorkflowControl'
import { InputValueControl } from 'renderer/nodeEditor/nodes/Controls/input/InputValue'

export class FetchTemplateWorkflowsNode extends SerializableInputsNode<
  'FetchTemplateWorkflows',
  { exec: TypedSocket; endpoint: TypedSocket },
  { workflowRef: TypedSocket },
  { select: SelectWorkflowControl }
> {
  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private history: HistoryPlugin<Schemes>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('FetchTemplateWorkflows')
    this.width = 340
    this.height = 315
    this.addInputPort([
      {
        key: 'exec',
        label: 'Fetch',
        onClick: () => this.controlflow.execute(this.id),
      },
      {
        key: 'endpoint',
        typeName: 'string',
        label: 'Endpoint',
        control: new InputValueControl<string>({
          label: 'Endpoint',
          value: 'http://127.0.0.1:8000',
          type: 'string',
          history: this.history,
          area: this.area,
          onChange: () => this.dataflow.reset(this.id),
        }),
      },
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
    const dfInputs = await this.dataflow.fetchInputs(this.id)
    const endpoint = this.getInputValue<string>(dfInputs, 'endpoint')
    if (!endpoint) {
      await this.controls.select.setItems([])
      this.controls.select.setError('Endpoint is required')
      return
    }
    this.controls.select.setLoading()
    try {
      const list = await electronApiService.listTemplateWorkflows(endpoint)
      await this.controls.select.setItems(list)
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
