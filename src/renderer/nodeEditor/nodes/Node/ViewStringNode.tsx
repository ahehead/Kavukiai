import { ClassicPreset } from 'rete';
import { ExecSocket, StringSocket } from '../Sockets';
import type { DataflowEngine } from 'rete-engine';
import type { AreaExtra, ExtraSizeData, Schemes } from 'renderer/nodeEditor/types';
import type { AreaPlugin } from 'rete-area-plugin';
import { MultiLineControl } from '../Controls/TextArea';


// View String ノード
export class ViewStringNode extends ClassicPreset.Node<
  { exec: ClassicPreset.Socket; stringValue: ClassicPreset.Socket },
  { exec: ClassicPreset.Socket; stringValue: ClassicPreset.Socket },
  { view: MultiLineControl }
> implements ExtraSizeData {

  public width?: number;
  public height?: number;

  constructor(
    private dataflow: DataflowEngine<Schemes>,
    private area: AreaPlugin<Schemes, AreaExtra>
  ) {
    super('ViewString');

    this.addInput('exec', new ClassicPreset.Input(new ExecSocket(), undefined, true));
    this.addInput('stringValue', new ClassicPreset.Input(new StringSocket(), 'string'));

    this.addOutput('exec', new ClassicPreset.Output(new ExecSocket(), undefined, true));
    this.addOutput('stringValue', new ClassicPreset.Output(new StringSocket(), 'string'));

    this.addControl('view', new MultiLineControl("", undefined, false));
  }

  data(inputs: { stringValue?: string[] }): { stringValue: string } {
    const value = inputs.stringValue?.[0] || '';
    return { stringValue: value };
  }

  // 実行時、stringValueを取得して表示する
  async execute(_input: 'exec', forward: (output: 'exec') => void): Promise<void> {
    // dataflowのリセット。
    this.dataflow.reset();
    const { stringValue } = (await this.dataflow.fetchInputs(this.id)) as { stringValue?: string[] }

    // stringValueがundefinedの場合は何もしない
    if (!stringValue) return;

    this.controls.view.setValue(stringValue[0] || '');
    await this.area.update("control", this.controls.view.id);

    forward('exec');
  }

  toJSON(): { data: any } {
    return { data: this.controls.view.value || '' };
  }
}

