
import type { DataflowEngine } from 'rete-engine';
import { BaseNode } from "renderer/nodeEditor/types/BaseNode";
import type { AreaPlugin } from 'rete-area-plugin';
import { MultiLineControl } from '../Controls/input/TextArea';
import type { AreaExtra, TypedSocket, Schemes } from 'renderer/nodeEditor/types';
import { formatValue } from '../util/formatValue';

// View String ノード
export class ViewStringNode extends BaseNode<
  {
    exec: TypedSocket;
    inputAny: TypedSocket
  },
  {
    exec: TypedSocket;
    outputAny: TypedSocket
  },
  { view: MultiLineControl }
> {
  constructor(
    private dataflow: DataflowEngine<Schemes>,
    private area: AreaPlugin<Schemes, AreaExtra>
  ) {
    super('ViewString');

    this.addInputPort([{
      key: "exec",
      schemaSpec: "exec",
      tooltip: "実行トリガー",
    }, {
      key: "inputAny",
      schemaSpec: "any",
      tooltip: "表示するデータ",
    }]);

    this.addOutputPort([{
      key: "exec",
      schemaSpec: "exec",
    }, {
      key: "outputAny",
      schemaSpec: "any",
    }]);

    this.addControlByKey({
      key: 'view',
      control: new MultiLineControl({ value: "", editable: false })
    });
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

    this.controls.view.setValue(formatValue(inputAny[0]));

    await this.area.update("control", this.controls.view.id);

    forward('exec');
  }

}

