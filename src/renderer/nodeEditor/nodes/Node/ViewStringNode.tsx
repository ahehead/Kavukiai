import { ClassicPreset } from 'rete';
import { createSocket } from '../Sockets';
import type { DataflowEngine } from 'rete-engine';
import { BaseNode, type AreaExtra, type CustomSocketType, type Schemes } from 'renderer/nodeEditor/types';
import type { AreaPlugin } from 'rete-area-plugin';
import { MultiLineControl } from '../Controls/TextArea';
const { Input, Output } = ClassicPreset;

// View String ノード
export class ViewStringNode extends BaseNode<
  { exec: CustomSocketType; stringValue: CustomSocketType },
  { exec: CustomSocketType; stringValue: CustomSocketType },
  { view: MultiLineControl }
> {
  constructor(
    private dataflow: DataflowEngine<Schemes>,
    private area: AreaPlugin<Schemes, AreaExtra>
  ) {
    super('ViewString');

    this.addInput(
      'exec',
      new Input(createSocket("exec"), undefined, false));
    this.addInput(
      'stringValue',
      new Input(createSocket("string"), undefined, false));

    this.addOutput(
      'exec',
      new Output(createSocket("exec"), undefined, true));
    this.addOutput(
      'stringValue',
      new Output(createSocket("string"), undefined,));

    this.addControl(
      'view',
      new MultiLineControl("", false));
  }

  data(inputs: { stringValue?: string[] }): { stringValue: string } {
    const value = inputs.stringValue?.[0] || '';
    return { stringValue: value };
  }

  // 実行時、stringValueを取得して表示する
  async execute(_input: 'exec', forward: (output: 'exec') => void): Promise<void> {
    const { stringValue } = (await this.dataflow.fetchInputs(this.id)) as { stringValue?: string[] }

    // stringValueがundefinedの場合は何もしない
    if (!stringValue) return;

    this.controls.view.setValue(stringValue[0] || '');
    await this.area.update("control", this.controls.view.id);

    forward('exec');
  }

}

