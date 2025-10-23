import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import {
  type AreaExtra,
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import type { AreaPlugin } from 'rete-area-plugin'
import type { HistoryPlugin } from 'rete-history-plugin'
import { InputValueControl } from 'renderer/nodeEditor/nodes/Controls/input/InputValue'

export class DefaultStringNode extends SerializableInputsNode<
  'DefaultString',
  { target: TypedSocket; value: TypedSocket },
  { result: TypedSocket },
  object
> {
  constructor(
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>
  ) {
    super('DefaultString')

    this.addInputPort([
      { key: 'target', typeName: 'StringOrNull', label: 'target' },
      {
        key: 'value',
        typeName: 'string',
        label: 'value',
        control: new InputValueControl<string>({
          value: '',
          type: 'string',
          label: 'value',
          editable: true,
          history,
          area,
          onChange: () => this.dataflow.reset(this.id),
        }),
      },
    ])

    this.addOutputPort({ key: 'result', typeName: 'string', label: 'result' })
  }

  data(inputs: { target?: (string | null)[]; value?: string[] }): {
    result: string
  } {
    const target = this.getInputValue<string | null>(inputs, 'target')
    const value = this.getInputValue<string>(inputs, 'value') ?? ''
    return { result: (target ?? value) }
  }
}

