import { electronApiService } from 'renderer/features/services/appService'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { NodeStatus } from 'renderer/nodeEditor/types/Node/BaseNode'
import { SerializableInputsNode } from 'renderer/nodeEditor/types/Node/SerializableInputsNode'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import type { HistoryPlugin } from 'rete-history-plugin'
import { InputValueControl } from 'renderer/nodeEditor/nodes/Controls/input/InputValue'
import { SelectStringListControl } from 'renderer/nodeEditor/nodes/Controls/input/SelectStringListControl'

export class FetchCheckpointsNode extends SerializableInputsNode<
  'FetchCheckpoints',
  { exec: TypedSocket; exec2: TypedSocket; endpoint: TypedSocket },
  { key: TypedSocket },
  { endpoint: InputValueControl<string>; list: SelectStringListControl }
> {
  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private history: HistoryPlugin<Schemes>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('FetchCheckpoints')
    this.width = 320
    this.height = 300

    this.addInputPort([
      {
        key: 'exec',
        label: 'Fetch',
        onClick: () => this.controlflow.execute(this.id, 'exec'),
      },
      {
        key: 'exec2',
        label: 'Clear list',
        onClick: () => this.controlflow.execute(this.id, 'exec2'),
      },
      {
        key: 'endpoint',
        typeName: 'string',
        label: 'Endpoint',
        control: new InputValueControl<string>({
          label: 'Endpoint',
          value: 'http://127.0.0.1:8000',
          type: 'string',
          history: this.history,
          area: this.area,
          onChange: () => this.dataflow.reset(this.id),
        }),
      },
    ])

    this.addOutputPort({
      key: 'key',
      typeName: 'StringOrNull',
      label: 'Checkpoint',
    })

    this.addControl(
      'list',
      new SelectStringListControl({
        history,
        onChange: () => this.dataflow.reset(this.id),
      })
    )
  }

  async execute(input: 'exec' | 'exec2'): Promise<void> {
    if (input === 'exec2') {
      await this.controls.list.setItems([])
      this.changeStatus(NodeStatus.IDLE)
      return
    }

    const dfInputs = await this.dataflow.fetchInputs(this.id)
    const endpoint = this.getInputValue<string>(dfInputs, 'endpoint')
    if (!endpoint) {
      await this.controls.list.setItems([])
      this.changeStatus(NodeStatus.ERROR)
      return
    }

    this.controls.list.setLoading()
    this.changeStatus(NodeStatus.RUNNING)
    try {
      const list = await electronApiService.getCheckpoints(endpoint)
      await this.controls.list.setItems(list)
      this.changeStatus(NodeStatus.COMPLETED)
    } catch (error) {
      console.error('Failed to fetch checkpoints', error)
      await this.controls.list.setItems([])
      this.changeStatus(NodeStatus.ERROR)
    }
  }

  data(): { key: string | null } {
    return { key: this.controls.list.getSelected() }
  }

  serializeControlValue() {
    return this.controls.list.toJSON()
  }

  deserializeControlValue(data: any) {
    this.controls.list.setFromJSON({ data })
  }
}
