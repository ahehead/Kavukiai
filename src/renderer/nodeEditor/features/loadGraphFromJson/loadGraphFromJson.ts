import type { AreaExtra, Schemes } from "renderer/nodeEditor/types/Schemes";
import { nodeFactories } from "../../nodes/nodeFactories";
import { ClassicPreset, type NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine, DataflowEngine } from "rete-engine";
import type { HistoryActions, HistoryPlugin } from "rete-history-plugin";
import type { GraphJsonData, InputPortJson } from "shared/JsonType";

// JSON からノードを生成してエディタに登録
export async function loadGraphFromJson(
  graphJsonData: GraphJsonData,
  area: AreaPlugin<Schemes, AreaExtra>,
  editor: NodeEditor<Schemes>,
  dataflow: DataflowEngine<Schemes>,
  controlflow: ControlFlowEngine<Schemes>,
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>
): Promise<void> {
  // ノードの登録
  for (const {
    id,
    type,
    position,
    size,
    data,
    inputs,
  } of graphJsonData.nodes) {
    // ノードごとのファクトリを取得
    let factory = nodeFactories[type];
    if (!factory) {
      factory = nodeFactories.UnknownNode;
      console.warn(`Unknown node type: ${type}. Using UnknownNode.`);
    }

    // ノードのインスタンスを生成
    const node = factory({
      editor,
      area,
      dataflow,
      controlflow,
      history,
    });

    // ノードにfromJsonがあり、データがある場合はデータをセット
    if (typeof (node as any).fromJSON === "function" && data) {
      (node as any).fromJSON(data as Record<string, unknown>);
    }

    // ノードにsetFromInputsJsonがあり、inputsデータがある場合はデータをセット
    if (typeof (node as any).setFromInputsJson === "function" && inputs) {
      (node as any).setFromInputsJson(inputs as Record<string, InputPortJson>);
    }

    node.id = id;
    await editor.addNode(node);
    if (size.width && size.height) {
      node.setSize(size.width, size.height);
      await area.resize(id, size.width, size.height);
    }
    await area.translate(id, position);
  }

  // ノードの接続を作成
  for (const {
    id,
    source,
    sourcePort,
    target,
    targetPort,
  } of graphJsonData.connections || []) {
    // 接続元と接続先のノードを取得
    const sourceNode = editor.getNode(source);
    const targetNode = editor.getNode(target);
    if (sourceNode && targetNode) {
      const conn = new ClassicPreset.Connection(
        sourceNode,
        sourcePort as never,
        targetNode,
        targetPort as never
      );
      conn.id = id;
      await editor.addConnection(conn);
    } else {
      console.error(`Connection error: ${source} -> ${target}`);
    }
  }

  // 必要に応じて metadata を扱う
  if (graphJsonData.metadata) {
  }
}
