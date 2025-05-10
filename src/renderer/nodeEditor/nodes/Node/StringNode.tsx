import { ClassicPreset } from 'rete';
import { createSocket } from '../Sockets';
import type { CustomSocketType, ExtraSizeData } from 'renderer/nodeEditor/types';
const { Node, Output } = ClassicPreset;
// 短い文字列入力ノード
export class StringNode extends Node<
  object,
  { out: CustomSocketType },
  { textInput: ClassicPreset.InputControl<'text'> }
> implements ExtraSizeData {
  public width?: number;
  public height?: number;
  constructor(
    initial = ''
  ) {
    super('String');
    this.addOutput(
      'out',
      new Output(createSocket("string"), undefined));
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
