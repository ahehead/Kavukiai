import { electronApiService } from 'renderer/features/services/appService'
import {
  type AreaExtra,
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import { NodeStatus } from 'renderer/nodeEditor/types/Node/BaseNode'

import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import { ConsoleControl } from '../../Controls/Console'

export class LMStudioStartNode extends SerializableInputsNode<
  'LMStudioStart',
  { exec: TypedSocket },
  { exec: TypedSocket },
  { console: ConsoleControl }
> {
  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('LMStudioStart')
    this.addInputPort({
      key: 'exec',
      typeName: 'exec',
      label: 'Start',
      onClick: () => this.controlflow.execute(this.id, 'exec'),
      tooltip: 'Start LM Studio server',
    })
    this.addOutputPort({ key: 'exec', typeName: 'exec', label: 'Out' })
    this.addControl('console', new ConsoleControl({ isOpen: true }))
  }

  data(): object {
    return {}
  }

  async execute(
    _input: 'exec',
    forward: (output: 'exec') => void
  ): Promise<void> {
    if (this.status === NodeStatus.RUNNING) return

    await this.changeStatus(this.area, NodeStatus.RUNNING)
    const result = await electronApiService.startServer()
    if (result.status === 'success') {
      this.controls.console.addValue(result.data)
      this.setStatus(NodeStatus.COMPLETED)
    } else {
      this.controls.console.addValue(`Error: ${result.message}`)
      this.setStatus(NodeStatus.ERROR)
    }
    await this.area.update('node', this.id)
    forward('exec')
  }

  serializeControlValue() {
    return this.controls.console.toJSON()
  }

  deserializeControlValue(data: any) {
    this.controls.console.setFromJSON({ data })
  }
}
