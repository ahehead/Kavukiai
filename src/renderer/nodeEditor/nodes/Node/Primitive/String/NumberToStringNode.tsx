import { SerializableInputsNode, type TypedSocket } from 'renderer/nodeEditor/types';

export class NumberToStringNode extends SerializableInputsNode<
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

  async execute(): Promise<void> { }
}
