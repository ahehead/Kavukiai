import type { TypedSocket } from 'renderer/nodeEditor/types';
import { BaseNode } from 'renderer/nodeEditor/types/Node/BaseNode';

export class NumberToStringNode extends BaseNode<
  'NumberToString',
  { num: TypedSocket },
  { out: TypedSocket },
  object
> {
  constructor() {
    super('NumberToString');
    this.addInputPort({ key: 'num', typeName: 'number', label: 'number' });
    this.addOutputPort({ key: 'out', typeName: 'string', label: 'out' });
  }

  data(inputs: { num?: number[] }): { out: string } {
    const n = inputs.num?.[0];
    return { out: n !== undefined ? String(n) : '' };
  }

  async execute(): Promise<void> {}
}
