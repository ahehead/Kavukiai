import { InputValueControl } from 'renderer/nodeEditor/nodes/Controls/input/InputValue';
import { getInputValue } from 'renderer/nodeEditor/nodes/util/getInput';
import { resetCacheDataflow } from 'renderer/nodeEditor/nodes/util/resetCacheDataflow';
import type { Schemes, TypedSocket } from 'renderer/nodeEditor/types';
import { BaseNode } from 'renderer/nodeEditor/types/Node/BaseNode';
import type { DataflowEngine } from 'rete-engine';

export class CodeFenceNode extends BaseNode<
  'CodeFence',
  { input: TypedSocket; lang: TypedSocket },
  { out: TypedSocket },
  object
> {
  constructor(private dataflow: DataflowEngine<Schemes>) {
    super('CodeFence');
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
          onChange: () => resetCacheDataflow(this.dataflow, this.id),
        }),
      },
    ]);
    this.addOutputPort({ key: 'out', typeName: 'string', label: 'out' });
  }

  data(inputs: { input?: string[]; lang?: string[] }): { out: string } {
    const code = inputs.input?.[0] ?? '';
    const lang = inputs.lang?.[0] ?? getInputValue(this.inputs, 'lang', inputs) ?? '';
    return { out: `\`\`\`${lang}\n${code}\n\`\`\`` };
  }

  async execute(): Promise<void> {}
}
