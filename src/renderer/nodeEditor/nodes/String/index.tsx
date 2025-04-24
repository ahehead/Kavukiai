import { ClassicPreset } from 'rete';
import { StringSocket } from '../Sockets';

// 短い文字列入力ノード
export class StringNode extends ClassicPreset.Node<
  object,
  { out: ClassicPreset.Socket },
  { textInput: ClassicPreset.InputControl<'text'> }
> {
  constructor() {
    super('String');
    this.addOutput('out', new ClassicPreset.Output(new StringSocket(), 'string'));
    this.addControl(
      'textInput',
      new ClassicPreset.InputControl('text', { initial: '' })
    );
  }

  data(): { out: string } {
    return { out: this.controls.textInput.value || '' };
  }

  async execute(): Promise<void> { }
}
