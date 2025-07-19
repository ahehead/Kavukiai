import { electronApiService } from 'renderer/features/services/appService'
import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { NodeStatus } from 'renderer/nodeEditor/types/Node/BaseNode'
import { SerializableInputsNode } from 'renderer/nodeEditor/types/Node/SerializableInputsNode'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import { ConsoleControl } from '../../Controls/Console'

export class UnLoadModelNode extends SerializableInputsNode<
  'UnLoadModel',
  { exec: TypedSocket },
  Record<string, never>,
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
    this.addControl('console', new ConsoleControl({ isOpen: true }))
  }

  data(): object {
    return {}
  }

  async execute(): Promise<void> {
    if (this.status === NodeStatus.RUNNING) {
      return
    }
    await this.setStatus(this.area, NodeStatus.RUNNING)
    const result = await electronApiService.unloadAllModels()
    if (result.status === 'success') {
      this.controls.console.addValue('unloaded')
      await this.setStatus(this.area, NodeStatus.COMPLETED)
    } else {
      this.controls.console.addValue(`Error: ${result.message}`)
      await this.setStatus(this.area, NodeStatus.ERROR)
    }
    await this.area.update('node', this.id)
  }

  serializeControlValue() {
    return this.controls.console.toJSON()
  }

  deserializeControlValue(data: any) {
    this.controls.console.setFromJSON({ data })
  }
}
