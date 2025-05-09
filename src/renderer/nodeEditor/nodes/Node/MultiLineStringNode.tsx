import { ClassicPreset } from 'rete';
import { StringSocket } from '../Sockets';
import { MultiLineControl } from '../Controls/TextArea';
import type { HistoryPlugin } from 'rete-history-plugin';
import type { AreaExtra, ExtraSizeData, Schemes } from 'renderer/nodeEditor/types';
import type { AreaPlugin } from 'rete-area-plugin';

// 長文文字列入力ノード
export class MultiLineStringNode extends ClassicPreset.Node<
  object,
  { out: ClassicPreset.Socket },
  { textArea: MultiLineControl }
> implements ExtraSizeData {
  public width?: number;
  public height?: number;

  constructor(
    initial = '',
    history?: HistoryPlugin<Schemes>,
    area?: AreaPlugin<Schemes, AreaExtra>
  ) {
    super('MultiLineString');
    this.addOutput('out', new ClassicPreset.Output(new StringSocket(), 'string'));
    this.addControl('textArea', new MultiLineControl(initial, undefined, true, history, area));
  }

  // dataflowで流す
  data(): { out: string } {
    return { out: this.controls.textArea.value || '' };
  }

  async execute(): Promise<void> { }

  toJSON(): { data: any } {
    return {
      data: {
        value: this.controls.textArea.value || '',
        editable: this.controls.textArea.editable,
      }
    };
  }

  // JSONから復元
  fromJSON(data: { value: string, editable: boolean }): void {
    this.controls.textArea.setValue(data.value);
    this.controls.textArea.setEditable(data.editable);
  }
}
