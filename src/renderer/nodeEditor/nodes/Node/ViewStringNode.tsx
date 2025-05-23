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
  { exec: NodeSocket; inputAny: NodeSocket },
  { exec: NodeSocket; outputAny: NodeSocket },
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
      'inputAny',
      new Input(createSocket("any"), undefined, false));

    this.addOutput(
      'exec',
      new Output(createSocket("exec"), undefined, true));
    this.addOutput(
      'outputAny',
      new Output(createSocket("any"), undefined, true));

    this.addControl(
      'view',
      new MultiLineControl("", { editable: false, }));
  }

  data(inputs: { inputAny?: any[] }): { outputAny: string } {
    const value = inputs.inputAny?.[0] || '';
    return { outputAny: value };
  }

  // 実行時、inputを取得して表示する
  async execute(_input: 'exec', forward: (output: 'exec') => void): Promise<void> {
    const { inputAny } = (await this.dataflow.fetchInputs(this.id)) as { inputAny?: any[] }

    // inputがundefinedの場合は何もしない
    if (!inputAny) return;

    this.controls.view.setValue(`${inputAny[0]}` || '');
    resetCacheDataflow(this.dataflow, this.id);
    await this.area.update("control", this.controls.view.id);

    forward('exec');
  }

}

