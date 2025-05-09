import type { AreaExtra, Schemes } from "renderer/nodeEditor/types";
import { nodeFactories } from "./nodeFactories";
import { ClassicPreset, type NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine, DataflowEngine } from "rete-engine";
import type { HistoryActions, HistoryPlugin } from "rete-history-plugin";
import type { GraphJsonData } from "shared/JsonType";

// JSON からノードを生成してエディタに登録
export async function createNodes(
  graphJsonData: GraphJsonData,
  area: AreaPlugin<Schemes, AreaExtra>,
  editor: NodeEditor<Schemes>,
  dataflow: DataflowEngine<Schemes>,
  controlflow: ControlFlowEngine<Schemes>,
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>
): Promise<void> {
  // ノードの登録
  for (const { id, type, position, size, data } of graphJsonData.nodes) {
    // ノードごとのファクトリを取得
    const factory = nodeFactories[type];
    if (!factory) {
      console.error(`Unknown node type: ${type}`);
      continue;
    }

    // ノードのインスタンスを生成
    const node = factory({
      area,
      dataflow,
      controlflow,
      history,
    });

    // ノードにfromJsonがあり、データがある場合はデータをセット
    if (typeof (node as any).fromJSON === "function" && data) {
      (node as any).fromJSON(data as Record<string, unknown>);
    }

    node.id = id;
    await editor.addNode(node);
    if (size.width && size.height) {
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
