import { electronApiService } from 'renderer/features/services/appService'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { NodeStatus } from 'renderer/nodeEditor/types/Node/BaseNode'
import { SerializableInputsNode } from 'renderer/nodeEditor/types/Node/SerializableInputsNode'
import type { ServerStatusInfo } from 'renderer/nodeEditor/types/Schemas/lmstudio/StatusSchemas'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import { ConsoleControl } from '../../Controls/Console'

export class ServerStatusNode extends SerializableInputsNode<
  'ServerStatus',
  { exec: TypedSocket },
  { exec: TypedSocket; status: TypedSocket },
  { console: ConsoleControl }
> {
  private info: ServerStatusInfo = { server: 'OFF', loadedModels: [] }

  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('ServerStatus')
    this.addInputPort({
      key: 'exec',
      typeName: 'exec',
      label: 'Check',
      onClick: () => this.controlflow.execute(this.id, 'exec'),
    })
    this.addOutputPort([
      { key: 'exec', typeName: 'exec', label: 'Out' },
      { key: 'status', typeName: 'ServerStatusInfo', label: 'Status' },
    ])
    this.addControl('console', new ConsoleControl({ isOpen: true }))
  }

  data(): { status: ServerStatusInfo } {
    return { status: this.info }
  }

  async execute(
    _input: 'exec',
    forward: (output: 'exec') => void
  ): Promise<void> {
    if (this.status === NodeStatus.RUNNING) return
    await this.setStatus(this.area, NodeStatus.RUNNING)
    const result = await electronApiService.getServerStatus()
    if (result.status === 'success') {
      this.info = result.data
      this.dataflow.reset(this.id)
      this.controls.console.addValue(JSON.stringify(result.data))
      await this.setStatus(this.area, NodeStatus.COMPLETED)
    } else {
      this.controls.console.addValue(`Error: ${result.message}`)
      await this.setStatus(this.area, NodeStatus.ERROR)
    }
    await this.area.update('node', this.id)
    forward('exec')
  }

  serializeControlValue(): { data: { status: ServerStatusInfo } } {
    return { data: { status: this.info } }
  }

  deserializeControlValue(data: { status: ServerStatusInfo }): void {
    this.info = data.status
  }
}
