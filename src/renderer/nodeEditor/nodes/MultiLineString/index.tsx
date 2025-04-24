import { ClassicPreset } from 'rete';
import { StringSocket } from '../Sockets';

// 長文プロンプト入力用コントロール
export class MultiLineControl extends ClassicPreset.InputControl<'text'> {
  constructor(initial = '') {
    super('text');
    this.value = initial;
  }
}

// 長文文字列入力ノード
export class MultiLineStringNode extends ClassicPreset.Node<
  object,
  { out: ClassicPreset.Socket },
  { textArea: MultiLineControl }
> {
  constructor() {
    super('MultiLineString');
    this.addOutput('out', new ClassicPreset.Output(new StringSocket(), 'string'));
    this.addControl('textArea', new MultiLineControl());
  }

  data(): { out: string } {
    return { out: this.controls.textArea.value || '' };
  }

  async execute(): Promise<void> { }
}


