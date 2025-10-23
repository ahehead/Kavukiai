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
import type { IpcResult } from 'shared/ApiType'
import { ConsoleControl } from 'renderer/nodeEditor/nodes/Controls/Console/Console'

// ファイルパスから API 用 ComfyUI workflow JSON を読み込むノード
// 入力: exec, path(string)
// 出力: exec, workflow(object)
export class LoadWorkflowFileNode extends SerializableInputsNode<
  'LoadWorkflowFile',
  { exec: TypedSocket; path: TypedSocket },
  { exec: TypedSocket; workflow: TypedSocket },
  { console: ConsoleControl }
> {
  private lastWorkflow: unknown = null

  constructor(
    _area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('LoadWorkflowFile')
    this.addInputPort([
      {
        key: 'exec',
        label: 'Run',
        onClick: () => this.controlflow.execute(this.id, 'exec'),
      },
      {
        key: 'path',
        typeName: 'string',
        label: 'Path',
        require: true,
      },
    ])
    this.addOutputPort([
      { key: 'exec', typeName: 'exec', label: 'Out' },
      { key: 'workflow', typeName: 'object', label: 'json' },
    ])
    this.addControl('console', new ConsoleControl({ isOpen: true }))
  }

  data(): { workflow: unknown } {
    return { workflow: this.lastWorkflow }
  }

  async execute(_: never, forward: (output: 'exec') => void): Promise<void> {
    if (this.status === NodeStatus.RUNNING) return
    this.changeStatus(NodeStatus.RUNNING)

    const inputs = await this.dataflow.fetchInputs(this.id)
    const path = this.getInputValue<string>(inputs, 'path')

    if (!path) {
      this.changeStatus(NodeStatus.ERROR)
      this.controls.console.addValue('Error: path is empty')
      return
    }

    try {
      const res = (await electronApiService.readJsonByPath(path)) as IpcResult<unknown>
      if (res?.status === 'success') {
        this.lastWorkflow = res.data
        this.controls.console.addValue('Loaded workflow json from path')
        this.changeStatus(NodeStatus.COMPLETED)
        this.dataflow.reset(this.id)
        forward('exec')
      } else {
        this.changeStatus(NodeStatus.ERROR)
        this.controls.console.addValue(`Error: ${(res as any)?.message || 'Failed to read json'}`)
      }
    } catch (e: any) {
      this.changeStatus(NodeStatus.ERROR)
      this.controls.console.addValue(`Error: ${e?.message ?? String(e)}`)
    }
  }
}
