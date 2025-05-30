import { ClassicPreset } from 'rete';
import { MultiLineControl } from '../../Controls/input/TextArea';
import type { HistoryPlugin } from 'rete-history-plugin';
import { BaseNode } from "renderer/nodeEditor/types/BaseNode";
import type { AreaPlugin } from 'rete-area-plugin';
import type { DataflowEngine } from 'rete-engine';
import { resetCacheDataflow } from '../../util/resetCacheDataflow';
import { type AreaExtra, createSocket, type TypedSocket, type Schemes } from 'renderer/nodeEditor/types';
const { Output } = ClassicPreset;

// 長文文字列入力ノード
export class MultiLineStringNode extends BaseNode<
  object,
  { out: TypedSocket },
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
      new MultiLineControl({
        value: initial,
        history,
        area,
        onChange: (v: string) => {
          resetCacheDataflow(dataflow, this.id); // この階層じゃないとなぜかnodeIdがおかしくなる
        }
      })
    );
  }

  // dataflowで流す
  data(): { out: string } {
    console.log('data', this.controls.textArea.getValue());
    return { out: this.controls.textArea.getValue() || '' };
  }

  async execute(): Promise<void> { }

  toJSON(): { data: { value: string } } {
    return {
      data: {
        value: this.controls.textArea.getValue() || '',
      }
    };
  }

  // JSONから復元
  fromJSON(data: { value: string }): void {
    this.controls.textArea.setValue(data.value);
  }
}
