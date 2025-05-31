
import type { DataflowEngine } from 'rete-engine';
import { BaseNode } from "renderer/nodeEditor/types/BaseNode";
import type { AreaPlugin } from 'rete-area-plugin';
import { MultiLineControl } from '../Controls/input/TextArea';
import type { AreaExtra, TypedSocket, Schemes } from 'renderer/nodeEditor/types';
import { formatValue } from '../util/formatValue';
import { type, type Type } from 'arktype';
import type { NodeEditor } from 'rete';

// View String ノード
export class InspectorNode extends BaseNode<
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
    private editor: NodeEditor<Schemes>,
    private dataflow: DataflowEngine<Schemes>,
    private area: AreaPlugin<Schemes, AreaExtra>
  ) {
    super('Inspector');

    this.addInputPort([{
      key: "exec",
      schemaSpec: "exec",
      tooltip: "実行トリガー",
    }, {
      key: "inputAny",
      schemaSpec: "unknown",
      tooltip: "表示するデータ",
    }]);

    this.addOutputPort([{
      key: "exec",
      schemaSpec: "exec",
    }, {
      key: "outputAny",
      schemaSpec: "unknown",
    }]);

    this.addControlByKey({
      key: 'view',
      control: new MultiLineControl({ value: "", editable: false })
    });
  }

  data(inputs: { inputAny?: any[] }): { outputAny: any | undefined } {
    const value = inputs.inputAny?.[0] || undefined;
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

  connected(inputSchema: Type): void {
    //console.log("InspectorNode connected");
    this.inputs.inputAny?.socket.setSchema(inputSchema);
    this.outputs.outputAny?.socket.setSchema(inputSchema);
    this.area.update("node", this.id);
    // 自身の出力からつながっているInspectorNodeのsocketを更新
    // 処理的に世界にコネクションが多いと重くなる可能性がある
    const myConnection = this.editor.getConnections().filter(c => c.source === this.id && c.sourceOutput === "outputAny");
    for (const conn of myConnection) {
      const targetNode = this.editor.getNode(conn.target);
      if (targetNode instanceof InspectorNode) {
        targetNode.connected(inputSchema);
      }
    }

  }

  disconnected(): void {
    console.log("InspectorNode disconnected");
    // デフォルトの型に戻す
    this.inputs.inputAny?.socket.setSchema(type("unknown"));
    this.outputs.outputAny?.socket.setSchema(type("unknown"));
    this.area.update("node", this.id);
    const myConnection = this.editor.getConnections().filter(c => c.source === this.id && c.sourceOutput === "outputAny");
    for (const conn of myConnection) {
      const targetNode = this.editor.getNode(conn.target);
      if (targetNode instanceof InspectorNode) {
        targetNode.disconnected();
      }
    }
  }

}

