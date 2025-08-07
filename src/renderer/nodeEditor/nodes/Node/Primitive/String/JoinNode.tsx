import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { InputValueControl } from 'renderer/nodeEditor/nodes/Controls/input/InputValue'
import { unescapeSeparator } from 'renderer/nodeEditor/nodes/util/unescapeSeparator'
import type { Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { SerializableInputsNode } from 'renderer/nodeEditor/types/Node/SerializableInputsNode'

// JoinNode: 文字列配列を結合して返す
export class JoinNode extends SerializableInputsNode<
  'Join',
  { list: TypedSocket; separator: TypedSocket },
  { out: TypedSocket },
  object
> {
  constructor(private dataflow: DataflowEngine<Schemes>) {
    super('Join')
    this.addInputPort([
      { key: 'list', typeName: 'StringArray', label: 'list' },
      {
        key: 'separator',
        typeName: 'string',
        label: 'separator',
        control: new InputValueControl<string>({
          value: ',',
          type: 'string',
          editable: true,
          label: 'separator',
          onChange: _value => {
            this.dataflow.reset(this.id)
          },
        }),
      },
    ])
    this.addOutputPort({ key: 'out', typeName: 'string', label: 'out' })
  }

  data(inputs: { list?: string[][]; separator?: string[] }): { out: string } {
    const arr = inputs.list?.[0] ?? []
    const rawSep = this.getInputValue<string>(inputs, 'separator') || ','
    const sep = unescapeSeparator(rawSep)
    return { out: Array.isArray(arr) ? arr.join(sep) : '' }
  }

  async execute(): Promise<void> { }
}
