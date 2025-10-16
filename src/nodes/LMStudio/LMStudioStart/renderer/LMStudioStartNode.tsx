import { electronApiService } from 'renderer/features/services/appService'
import { ConsoleControl } from 'renderer/nodeEditor/nodes/Controls/Console/Console'
import {
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import { NodeStatus } from 'renderer/nodeEditor/types/Node/BaseNode'

import type { ControlFlowEngine } from 'rete-engine'

export class LMStudioStartNode extends SerializableInputsNode<
  'LMStudioStart',
  { exec: TypedSocket },
  { exec: TypedSocket },
  { console: ConsoleControl }
> {
  constructor(private controlflow: ControlFlowEngine<Schemes>) {
    super('LMStudioStart')
    this.addInputPort({
      key: 'exec',
      label: 'Start',
      onClick: () => this.controlflow.execute(this.id, 'exec'),
      tooltip: 'Start LM Studio server',
    })
    this.addOutputPort({ key: 'exec', typeName: 'exec', label: 'Out' })
    this.addControl('console', new ConsoleControl({ isOpen: true }))
  }

  async execute(
    _input: 'exec',
    forward: (output: 'exec') => void
  ): Promise<void> {
    if (this.status === NodeStatus.RUNNING) return

    this.changeStatus(NodeStatus.RUNNING)
    const result = await electronApiService.startServer()
    if (result.status === 'success') {
      this.controls.console.addValue(result.data)
      this.changeStatus(NodeStatus.COMPLETED)
    } else {
      this.controls.console.addValue(`Error: ${result.message}`)
      this.changeStatus(NodeStatus.ERROR)
    }
    forward('exec')
  }

  serializeControlValue() {
    return this.controls.console.toJSON()
  }

  deserializeControlValue(data: any) {
    this.controls.console.setFromJSON({ data })
  }
}
