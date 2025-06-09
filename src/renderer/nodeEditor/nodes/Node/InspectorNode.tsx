
import type { ControlFlowEngine, DataflowEngine } from 'rete-engine';
import { BaseNode } from "renderer/nodeEditor/nodes/Node/BaseNode";
import type { AreaPlugin } from 'rete-area-plugin';
import { MultiLineControl } from '../Controls/input/TextArea';
import type { AreaExtra, TypedSocket, Schemes } from 'renderer/nodeEditor/types';
import { formatValue } from '../util/formatValue';
import type { NodeEditor } from 'rete';
import { type TSchema, Type } from '@sinclair/typebox';

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
    private area: AreaPlugin<Schemes, AreaExtra>,
    public controlflow: ControlFlowEngine<Schemes>
  ) {
    super('Inspector');
    this.addInputPortPattern({
      type: "RunButton",
      controlflow: this.controlflow,
    })

    this.addInputPort([
      {
        key: "inputAny",
        name: "unknown",
        schema: Type.Unknown(),
        tooltip: "表示するデータ",
      }]);

    this.addOutputPort([{
      key: "exec",
      name: "exec",
      schema: Type.Literal("exec"),
    }, {
      key: "outputAny",
      name: "unknown",
      schema: Type.Unknown(),
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

  async connected(name: string, inputSchema: TSchema): Promise<void> {
    //console.log("InspectorNode connected");
    await this.inputs.inputAny?.socket.setSchema(name, inputSchema);
    await this.outputs.outputAny?.socket.setSchema(name, inputSchema);
    await this.area.update("node", this.id);
    // 自身の出力からつながっているInspectorNodeのsocketを更新
    const myConnection = this.editor.getConnections().filter(c => c.source === this.id && c.sourceOutput === "outputAny");
    for (const conn of myConnection) {
      const targetNode = this.editor.getNode(conn.target);
      if (targetNode instanceof InspectorNode) {
        await targetNode.connected(name, inputSchema);
      }
    }

  }

  async disconnected(): Promise<void> {
    //console.log("InspectorNode disconnected");
    // デフォルトの型に戻す
    await this.inputs.inputAny?.socket.setSchema("unknown", Type.Unknown());
    await this.outputs.outputAny?.socket.setSchema("unknown", Type.Unknown());
    await this.area.update("node", this.id);
    const myConnection = this.editor.getConnections().filter(c => c.source === this.id && c.sourceOutput === "outputAny");
    for (const conn of myConnection) {
      const targetNode = this.editor.getNode(conn.target);
      if (targetNode instanceof InspectorNode) {
        await targetNode.disconnected();
      }
    }
  }

}

