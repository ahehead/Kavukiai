import { ClassicPreset } from 'rete';
import { StringSocket } from '../Sockets';
import type { ExtraSizeData } from 'renderer/nodeEditor/types';

// 短い文字列入力ノード
export class StringNode extends ClassicPreset.Node<
  object,
  { out: ClassicPreset.Socket },
  { textInput: ClassicPreset.InputControl<'text'> }
> implements ExtraSizeData {
  public width?: number;
  public height?: number;
  constructor(
    initial = ''
  ) {
    super('String');
    this.addOutput('out', new ClassicPreset.Output(new StringSocket(), 'string'));
    this.addControl(
      'textInput',
      new ClassicPreset.InputControl('text', { initial: initial })
    );
  }

  data(): { out: string } {
    return { out: this.controls.textInput.value || '' };
  }

  async execute(): Promise<void> { }

  toJSON(): { data: any } {
    return {
      data:
        { value: this.controls.textInput.value || "" }
    };
  }

  fromJSON(data: { value: string }): void {
    this.controls.textInput.setValue(data.value);
  }
}
