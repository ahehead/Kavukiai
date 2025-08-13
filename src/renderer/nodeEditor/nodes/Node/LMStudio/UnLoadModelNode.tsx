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

export class UnLoadModelNode extends SerializableInputsNode<
  'UnLoadModel',
  { exec: TypedSocket },
  { exec: TypedSocket },
  { console: ConsoleControl }
> {
  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('UnLoadModel')
    this.addInputPort({
      key: 'exec',
      typeName: 'exec',
      label: 'Unload',
      onClick: () => this.controlflow.execute(this.id, 'exec'),
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
    const result = await electronApiService.unloadAllModels()
    if (result.status === 'success') {
      this.controls.console.addValue('unloaded')
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
