import { electronApiService } from 'renderer/features/services/appService'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import {
  type AreaExtra,
  NodeStatus,
  type Schemes,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import { SerializableInputsNode } from 'renderer/nodeEditor/types/Node/SerializableInputsNode'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import { ConsoleControl } from '../../Controls/Console'
import { PathInputControl } from '../../Controls/input/PathInputControl'

export class LoadWorkflowNode extends SerializableInputsNode<
  'LoadWorkflow',
  { exec: TypedSocket; path: TypedSocket },
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
        key: 'path',
        typeName: 'string',
        label: 'workflow.json path',
        control: new PathInputControl({
          placeholder: 'Select workflow.json',
          mode: 'file',
          filters: [{ name: 'JSON', extensions: ['json'] }],
        }),
        showControl: true,
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
    const inputs = await this.dataflow.fetchInputs(this.id)
    const filePath = this.getInputValue<string>(inputs, 'path')

    if (!filePath) {
      this.changeStatus(this.area, NodeStatus.ERROR)
      this.controls.console.addValue('Error: path is empty')
      return
    }

    try {
      const res = await electronApiService.readJsonByPath(filePath)
      if (!res || res.status !== 'success') {
        const msg = res?.message ?? 'Unknown error'
        this.controls.console.addValue(`Error: ${msg}`)
        return
      }
      this.lastWorkflow = res.data
      this.controls.console.addValue('Loaded workflow.json')
      this.dataflow.reset(this.id)
      forward('exec')
    } catch (e: any) {
      this.controls.console.addValue(`Error: ${e?.message ?? String(e)}`)
    }
  }
}
