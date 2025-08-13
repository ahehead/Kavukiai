import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import {
  type AreaExtra,
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import type { AreaPlugin } from 'rete-area-plugin'
import type { HistoryPlugin } from 'rete-history-plugin'
import { InputValueControl } from '../../Controls/input/InputValue'

// 数値入力ノード
export class NumberNode extends SerializableInputsNode<
  'Number',
  object,
  { out: TypedSocket },
  { numInput: InputValueControl<number> }
> {
  constructor(
    initial: number,
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super('Number')

    this.addOutputPort({
      key: 'out',
      typeName: 'number',
    })

    this.addControl(
      'numInput',
      new InputValueControl<number>({
        value: initial,
        type: 'number',
        editable: true,
        history,
        area,
        onChange: () => {
          dataflow.reset(this.id)
        },
      })
    )
  }

  data(): { out: number } {
    return { out: this.controls.numInput.value ?? 0 }
  }

  async execute(): Promise<void> { }

  serializeControlValue(): { data: { value: number } } {
    return {
      data: { value: this.controls.numInput.value ?? 0 },
    }
  }

  deserializeControlValue(data: { value: number }): void {
    this.controls.numInput.setValue(data.value)
  }
}
