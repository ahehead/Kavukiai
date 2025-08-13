import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { InputValueControl } from 'renderer/nodeEditor/nodes/Controls/input/InputValue'
import {
  type AreaExtra,
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'

import type { UPart } from 'renderer/nodeEditor/types/Schemas/UChat/UChatMessage'
import type { AreaPlugin } from 'rete-area-plugin'
import type { HistoryPlugin } from 'rete-history-plugin'

// 文字列からUPart(text)を作るノード
export class UPartTextNode extends SerializableInputsNode<
  'UPartText',
  { text: TypedSocket },
  { out: TypedSocket },
  object
> {
  private textControl: InputValueControl<string>

  constructor(
    initial = '',
    history?: HistoryPlugin<Schemes>,
    area?: AreaPlugin<Schemes, AreaExtra>,
    private dataflow?: DataflowEngine<Schemes>
  ) {
    super('UPartText')
    this.textControl = new InputValueControl<string>({
      value: initial,
      type: 'string',
      history,
      area,
      onChange: () => this.dataflow?.reset(this.id),
    })
    this.addInputPort({
      key: 'text',
      typeName: 'string',
      label: 'text',
      control: this.textControl,
      showControl: false,
    })
    this.addOutputPort({ key: 'out', typeName: 'UPart', label: 'out' })
  }

  data(inputs: { text?: string[] }): { out: UPart } {
    const text = inputs.text?.[0] ?? this.textControl.getValue() ?? ''
    return { out: { type: 'text', text } }
  }

  async execute(): Promise<void> { }
}
