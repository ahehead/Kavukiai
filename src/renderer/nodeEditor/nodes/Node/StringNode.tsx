import { ClassicPreset } from 'rete';
import { BaseNode } from "renderer/nodeEditor/types/BaseNode";
import { InputValueControl } from '../Controls/InputValue';
import type { HistoryPlugin } from 'rete-history-plugin';
import type { AreaPlugin } from 'rete-area-plugin';
import type { DataflowEngine } from 'rete-engine';
import { resetCacheDataflow } from '../util/resetCacheDataflow';
import { type AreaExtra, createSocket, type TypedSocket, type Schemes } from 'renderer/nodeEditor/types';
const { Node, Output } = ClassicPreset;
// 短い文字列入力ノード
export class StringNode extends BaseNode<
  object,
  { out: TypedSocket },
  { textInput: InputValueControl<string> }
> {
  constructor(
    initial: string,
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super('String');
    this.addOutput(
      'out',
      new Output(createSocket("string"), undefined));
    this.addControl(
      'textInput',
      new InputValueControl<string>(initial, {
        type: 'string',
        editable: true,
        history: history,
        area: area,
        onChange: (v: string) => {
          resetCacheDataflow(dataflow, this.id);
        }
      })
    );
  }

  data(): { out: string } {
    return { out: this.controls.textInput.value || '' };
  }

  async execute(): Promise<void> { }

  toJSON(): { data: { value: string } } {
    return {
      data: { value: this.controls.textInput.value || "" }
    };
  }

  fromJSON(data: { value: string }): void {
    this.controls.textInput.setValue(data.value);
  }
}
