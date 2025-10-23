import type { ModelInfo } from '@lmstudio/sdk'
import { electronApiService } from 'renderer/features/services/appService'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import {
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import { NodeStatus } from 'renderer/nodeEditor/types/Node/BaseNode'

import type { ControlFlowEngine } from 'rete-engine'
import { ConsoleControl } from 'renderer/nodeEditor/nodes/Controls/Console/Console'

export class ListDownloadedModelsNode extends SerializableInputsNode<
  'ListDownloadedModels',
  { exec: TypedSocket },
  { exec: TypedSocket; list: TypedSocket },
  { console: ConsoleControl }
> {
  private models: ModelInfo[] = []

  constructor(
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('ListDownloadedModels')
    this.addInputPort({
      key: 'exec',
      label: 'Get',
      onClick: () => this.controlflow.execute(this.id, 'exec'),
    })
    this.addOutputPort([
      { key: 'exec', typeName: 'exec', label: 'Out' },
      { key: 'list', typeName: 'ModelInfoArray', label: 'ModelInfo' },
    ])
    this.addControl('console', new ConsoleControl({ isOpen: true }))
  }

  data(): { list: ModelInfo[] } {
    return { list: this.models }
  }

  async execute(
    _input: 'exec',
    forward: (output: 'exec') => void
  ): Promise<void> {
    if (this.status === NodeStatus.RUNNING) {
      return // Prevent re-execution if already running
    }
    this.changeStatus(NodeStatus.RUNNING)
    const result = await electronApiService.listDownloadedModels()
    if (result.status === 'success') {
      this.models = result.data
      this.dataflow.reset(this.id)
      this.controls.console.addValue(`Downloaded models: ${this.models}`)
      this.changeStatus(NodeStatus.COMPLETED)
    } else {
      this.models = []
      this.controls.console.addValue(`Error: ${result.message}`)
      this.changeStatus(NodeStatus.ERROR)
    }
    forward('exec')
  }

  serializeControlValue(): { data: { list: ModelInfo[] } } {
    return { data: { list: this.models } }
  }

  deserializeControlValue(data: { list: ModelInfo[] }): void {
    this.models = data.list
  }
}
