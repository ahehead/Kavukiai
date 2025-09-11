import { electronApiService } from 'renderer/features/services/appService'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import {
  type AreaExtra,
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import { NodeStatus } from 'renderer/nodeEditor/types/Node/BaseNode'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import type { HistoryPlugin } from 'rete-history-plugin'
import { ConsoleControl } from '../../Controls/Console/Console'
import { CheckBoxControl } from '../../Controls/input/CheckBox'
import { InputValueControl } from '../../Controls/input/InputValue'

export class ComfyUIFreeMemoryNode extends SerializableInputsNode<
  'ComfyUIFreeMemory',
  {
    exec: TypedSocket
    endpoint: TypedSocket
    unloadModels: TypedSocket
    freeMemory: TypedSocket
  },
  { exec: TypedSocket },
  { console: ConsoleControl }
> {
  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private history: HistoryPlugin<Schemes>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>,
  ) {
    super('ComfyUIFreeMemory')

    this.addInputPort([
      {
        key: 'exec',
        label: 'Free',
        onClick: () => this.controlflow.execute(this.id, 'exec'),
        tooltip: 'Free ComfyUI memory (optionally unload models)',
      },
      {
        key: 'endpoint',
        typeName: 'string',
        label: 'Endpoint',
        control: new InputValueControl<string>({
          value: 'http://127.0.0.1:8000',
          type: 'string',
          history: this.history,
          area: this.area,
          onChange: () => this.dataflow?.reset(this.id),
        }),
      },
      {
        key: 'unloadModels',
        typeName: 'boolean',
        label: 'unloadModels',
        control: new CheckBoxControl({
          value: true,
          label: 'unloadModels',
          editable: true,
        }),
      },
      {
        key: 'freeMemory',
        typeName: 'boolean',
        label: 'freeMemory',
        control: new CheckBoxControl({
          value: true,
          label: 'freeMemory',
          editable: true,
        }),
      },
    ])

    this.addOutputPort({ key: 'exec', typeName: 'exec', label: 'Out' })
    this.addControl('console', new ConsoleControl({ isOpen: true }))
  }

  async execute(
    _input: 'exec',
    forward: (output: 'exec') => void
  ): Promise<void> {
    if (this.status === NodeStatus.RUNNING) return
    this.changeStatus(NodeStatus.RUNNING)
    try {
      const dfInputs: any = this.dataflow.fetchInputs(this.id)

      const endpoint =
        this.getInputValue<string>(dfInputs, 'endpoint') ??
        'http://127.0.0.1:8000'
      const unloadModels =
        this.getInputValue<boolean>(dfInputs, 'unloadModels') ?? true
      const freeMemory =
        this.getInputValue<boolean>(dfInputs, 'freeMemory') ?? true

      this.controls.console.addValue(
        `[INFO] Freeing memory (unloadModels=${unloadModels}, freeMemory=${freeMemory})`
      )

      await electronApiService.freeMemory({
        endpoint,
        unloadModels,
        freeMemory,
      })
      this.controls.console.addValue('[OK] Memory freed')
      this.changeStatus(NodeStatus.COMPLETED)

    } catch (e: any) {
      this.controls.console.addValue(`[ERROR] ${e?.message ?? e}`)
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
