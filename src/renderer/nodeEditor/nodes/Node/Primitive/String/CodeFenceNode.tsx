import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { InputValueControl } from 'renderer/nodeEditor/nodes/Controls/input/InputValue'
import {
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'

export class CodeFenceNode extends SerializableInputsNode<
  'CodeFence',
  { input: TypedSocket; lang: TypedSocket },
  { out: TypedSocket },
  object
> {
  constructor(private dataflow: DataflowEngine<Schemes>) {
    super('CodeFence')
    this.addInputPort([
      { key: 'input', typeName: 'string', label: 'input' },
      {
        key: 'lang',
        typeName: 'string',
        label: 'lang',
        control: new InputValueControl<string>({
          value: '',
          type: 'string',
          editable: true,
          onChange: () => this.dataflow.reset(this.id),
        }),
      },
    ])
    this.addOutputPort({ key: 'out', typeName: 'string', label: 'out' })
  }

  data(inputs: { input?: string[]; lang?: string[] }): { out: string } {
    const code = inputs.input?.[0] ?? ''
    const lang = this.getInputValue<string>(inputs, 'lang') ?? ''
    return { out: `\`\`\`${lang}\n${code}\n\`\`\`` }
  }

  async execute(): Promise<void> { }
}
