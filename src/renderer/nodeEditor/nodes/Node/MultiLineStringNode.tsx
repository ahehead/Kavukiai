import { ClassicPreset } from 'rete';
import { createSocket } from '../Sockets';
import { MultiLineControl } from '../Controls/TextArea';
import type { HistoryPlugin } from 'rete-history-plugin';
import { BaseNode, type AreaExtra, type CustomSocketType, type Schemes } from 'renderer/nodeEditor/types';
import type { AreaPlugin } from 'rete-area-plugin';
import type { DataflowEngine } from 'rete-engine';
const { Output } = ClassicPreset;

// 長文文字列入力ノード
export class MultiLineStringNode extends BaseNode<
  object,
  { out: CustomSocketType },
  { textArea: MultiLineControl }
> {

  constructor(
    initial: string,
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>,
  ) {
    super('MultiLineString');
    this.addOutput(
      'out',
      new Output(createSocket("string"), undefined));
    this.addControl(
      'textArea',
      new MultiLineControl(initial, true, this.id, history, area, dataflow));
  }

  // dataflowで流す
  data(): { out: string } {
    return { out: this.controls.textArea.value || '' };
  }

  async execute(): Promise<void> { }

  toJSON(): { data: { value: string, editable: boolean } } {
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
