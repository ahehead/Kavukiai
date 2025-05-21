import { ClassicPreset } from 'rete';
import type { DataflowEngine } from 'rete-engine';
import { BaseNode } from "renderer/nodeEditor/types/BaseNode";
import type { AreaPlugin } from 'rete-area-plugin';
import { MultiLineControl } from '../Controls/TextArea';
import { resetCacheDataflow } from '../util/resetCacheDataflow';
import { type AreaExtra, createSocket, type NodeSocket, type Schemes } from 'renderer/nodeEditor/types';
const { Input, Output } = ClassicPreset;

// View String ノード
export class ViewStringNode extends BaseNode<
  { exec: NodeSocket; inputString: NodeSocket },
  { exec: NodeSocket; outputString: NodeSocket },
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
      'inputString',
      new Input(createSocket("string"), undefined, false));

    this.addOutput(
      'exec',
      new Output(createSocket("exec"), undefined, true));
    this.addOutput(
      'outputString',
      new Output(createSocket("string"), undefined,));

    this.addControl(
      'view',
      new MultiLineControl("", { editable: false, }));
  }

  data(inputs: { inputString?: string[] }): { outputString: string } {
    const value = inputs.inputString?.[0] || '';
    return { outputString: value };
  }

  // 実行時、inputを取得して表示する
  async execute(_input: 'exec', forward: (output: 'exec') => void): Promise<void> {
    const { inputString } = (await this.dataflow.fetchInputs(this.id)) as { inputString?: string[] }

    // inputがundefinedの場合は何もしない
    if (!inputString) return;

    this.controls.view.setValue(inputString[0] || '');
    resetCacheDataflow(this.dataflow, this.id);
    await this.area.update("control", this.controls.view.id);

    forward('exec');
  }

}

