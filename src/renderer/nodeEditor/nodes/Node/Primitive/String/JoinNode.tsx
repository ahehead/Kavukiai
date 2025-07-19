import { InputValueControl } from 'renderer/nodeEditor/nodes/Controls/input/InputValue'
import { getInputValue } from 'renderer/nodeEditor/nodes/util/getInput';
import { resetCacheDataflow } from 'renderer/nodeEditor/nodes/util/resetCacheDataflow';
import { unescapeSeparator } from 'renderer/nodeEditor/nodes/util/unescapeSeparator';
import type { Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { SerializableInputsNode } from 'renderer/nodeEditor/types/Node/SerializableInputsNode';
import type { DataflowEngine } from 'rete-engine';

// JoinNode: 文字列配列を結合して返す
export class JoinNode extends SerializableInputsNode<
  'Join',
  { list: TypedSocket; separator: TypedSocket },
  { out: TypedSocket },
  object
> {
  constructor(
    private dataflow: DataflowEngine<Schemes>
  ) {
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
          onChange: (_value) => {
            resetCacheDataflow(this.dataflow, this.id)
          }
        },
        )
      }
    ])
    this.addOutputPort({ key: 'out', typeName: 'string', label: 'out' })
  }

  data(inputs: { list?: string[][]; separator?: string[] }): { out: string } {
    const arr = inputs.list?.[0] ?? []
    const rawSep = getInputValue(this.inputs, "separator", inputs);
    const sep = unescapeSeparator(rawSep);
    return { out: Array.isArray(arr) ? arr.join(sep) : '' }
  }

  async execute(): Promise<void> { }
}
