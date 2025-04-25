import { ClassicPreset } from 'rete';
import { StringSocket } from '../Sockets';
import { MultiLineControl } from '../components/TextArea';



// 長文文字列入力ノード
export class MultiLineStringNode extends ClassicPreset.Node<
  object,
  { out: ClassicPreset.Socket },
  { textArea: MultiLineControl }
> {
  constructor(initial = '') {
    super('MultiLineString');
    this.addOutput('out', new ClassicPreset.Output(new StringSocket(), 'string'));
    this.addControl('textArea', new MultiLineControl(initial, undefined, true));
  }

  // dataflowで流す
  data(): { out: string } {
    return { out: this.controls.textArea.value || '' };
  }

  async execute(): Promise<void> { }
}


