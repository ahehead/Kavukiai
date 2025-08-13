import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { InputValueControl } from 'renderer/nodeEditor/nodes/Controls/input/InputValue'
import {
  type AreaExtra,
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import type { SerializableDataNode } from 'renderer/nodeEditor/types/Node/SerializableDataNode'
import type { AreaPlugin } from 'rete-area-plugin'
import type { HistoryPlugin } from 'rete-history-plugin'
// 短い文字列入力ノード
export class StringNode
  extends SerializableInputsNode<
    'String',
    object,
    { out: TypedSocket },
    { textInput: InputValueControl<string> }
  >
  implements SerializableDataNode {
  constructor(
    initial: string,
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super('String')

    this.addOutputPort({
      key: 'out',
      typeName: 'string',
    })

    this.addControl(
      'textInput',
      new InputValueControl<string>({
        value: initial,
        type: 'string',
        editable: true,
        history: history,
        area: area,
        onChange: (_v: string) => {
          dataflow.reset(this.id)
        },
      })
    )
  }

  data(): { out: string } {
    return { out: this.controls.textInput.value || '' }
  }

  async execute(): Promise<void> { }

  serializeControlValue(): { data: { value: string } } {
    return {
      data: { value: this.controls.textInput.value || '' },
    }
  }

  deserializeControlValue(data: { value: string }): void {
    this.controls.textInput.setValue(data.value)
  }
}
