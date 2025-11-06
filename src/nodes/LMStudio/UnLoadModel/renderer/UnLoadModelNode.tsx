import { electronApiService } from 'renderer/features/services/appService'
import {
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import { NodeStatus } from 'renderer/nodeEditor/types/Node/BaseNode'

import type { ControlFlowEngine } from 'rete-engine'
import { ConsoleControl } from 'renderer/nodeEditor/nodes/Controls/Console/Console'

export class UnLoadModelNode extends SerializableInputsNode<
  'UnLoadModel',
  { exec: TypedSocket },
  { exec: TypedSocket },
  { console: ConsoleControl }
> {
  constructor(
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('UnLoadModel')
    this.addInputPort({
      key: 'exec',
      label: 'Unload',
      onClick: () => this.controlflow.execute(this.id, 'exec'),
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
    const result = await electronApiService.unloadAllModels()
    if (result.status === 'success') {
      this.controls.console.addValue('unloaded')
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
