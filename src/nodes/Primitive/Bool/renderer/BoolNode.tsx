import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import {
  type AreaExtra,
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import type { AreaPlugin } from 'rete-area-plugin'
import type { HistoryPlugin } from 'rete-history-plugin'
import { SwitchControl } from 'renderer/nodeEditor/nodes/Controls/input/Switch'

// Boolean入力ノード
export class BoolNode extends SerializableInputsNode<
  'Bool',
  object,
  { out: TypedSocket },
  { switch: SwitchControl }
> {
  constructor(
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super('Bool')
    const opts = {
      history,
      area,
      editable: true,
      onChange: () => dataflow.reset(this.id),
    }
    this.addOutputPort({
      key: 'out',
      typeName: 'boolean',
    })
    this.addControl(
      'switch',
      new SwitchControl({
        value: false,
        ...opts,
      })
    )
  }

  data(): { out: boolean } {
    return { out: this.controls.switch.getValue() }
  }

  async execute(): Promise<void> { }

  serializeControlValue(): { data: { value: boolean } } {
    return {
      data: {
        value: this.controls.switch.getValue(),
      },
    }
  }

  deserializeControlValue(data: { value: boolean }): void {
    this.controls.switch.setValue(data.value)
  }
}
