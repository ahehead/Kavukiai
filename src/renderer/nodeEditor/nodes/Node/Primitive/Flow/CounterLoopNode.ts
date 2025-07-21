import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import type { SerializableDataNode } from 'renderer/nodeEditor/types/Node/SerializableDataNode'
import { SerializableInputsNode } from 'renderer/nodeEditor/types/Node/SerializableInputsNode'
import { InputValueControl } from '../../../Controls/input/InputValue'
import { resetCacheDataflow } from '../../../util/resetCacheDataflow'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine, DataflowEngine } from 'rete-engine'
import type { HistoryPlugin } from 'rete-history-plugin'

export class CounterLoopNode
  extends SerializableInputsNode<
    'CounterLoop',
    { exec: TypedSocket; stop: TypedSocket; count: TypedSocket },
    { exec: TypedSocket; count: TypedSocket },
    { count: InputValueControl<number> }
  >
  implements SerializableDataNode
{
  private counter = 0

  constructor(
    initial: number,
    history: HistoryPlugin<Schemes>,
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('CounterLoop')

    this.addInputPort([
      {
        key: 'exec',
        typeName: 'exec',
        label: 'In',
        onClick: () => this.controlflow.execute(this.id, 'exec'),
      },
      {
        key: 'stop',
        typeName: 'exec',
        label: 'Stop',
        onClick: () => this.controlflow.execute(this.id, 'stop'),
      },
      {
        key: 'count',
        typeName: 'number',
        label: 'Count',
        showControl: true,
        control: new InputValueControl<number>({
          value: initial,
          type: 'number',
          editable: true,
          history,
          area,
          onChange: () => resetCacheDataflow(this.dataflow, this.id),
        }),
      },
    ])

    this.addOutputPort([
      { key: 'exec', typeName: 'exec', label: 'Out' },
      { key: 'count', typeName: 'number', label: 'Count' },
    ])

    this.counter = initial
  }

  data(): { count: number } {
    return { count: this.counter }
  }

  async execute(input: 'exec' | 'stop', forward: (output: 'exec') => void) {
    if (input === 'stop') {
      this.counter = 0
      return
    }

    if (this.counter <= 0) {
      const result = (await this.dataflow.fetchInputs(this.id)) as
        | { count?: number[] }
        | undefined
      const count = result?.count
      this.counter =
        count?.[0] ??
        (this.inputs.count.control as InputValueControl<number>).getValue() ?? 0
    }

    if (this.counter > 0) {
      this.counter -= 1
      await this.area.update('node', this.id)
      forward('exec')
    }
  }

  serializeControlValue(): { data: { value: number } } {
    const value = (this.inputs.count.control as InputValueControl<number>).getValue()
    return { data: { value } }
  }

  deserializeControlValue(data: { value: number }): void {
    ;(this.inputs.count.control as InputValueControl<number>).setValue(data.value)
    this.counter = data.value
  }
}
