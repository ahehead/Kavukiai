
import type { DataflowEngine } from 'rete-engine';
import { BaseNode } from "renderer/nodeEditor/types/BaseNode";
import type { AreaPlugin } from 'rete-area-plugin';
import { MultiLineControl } from '../Controls/TextArea';
import type { AreaExtra, TypedSocket, Schemes } from 'renderer/nodeEditor/types';

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
      control: new MultiLineControl("", { editable: false, })
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

export function formatValue(v: unknown, depth = 2): string {
  // 原始型
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint')
    return String(v);
  if (typeof v === 'function') return `[Function ${v.name ?? 'anonymous'}]`;

  // 配列・オブジェクトは JSON.stringify で整形 (循環参照対策付き)
  try {
    const cache = new WeakSet();
    return JSON.stringify(
      v,
      (_k, val) => {
        if (typeof val === 'object' && val !== null) {
          if (cache.has(val)) return '[Circular]';
          cache.add(val);
        }
        return val;
      },
      2 /* インデント */
    );
  } catch {
    // stringify 失敗時 util.inspect 風フォールバック
    return Object.prototype.toString.call(v);
  }
}
