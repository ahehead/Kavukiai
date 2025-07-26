import { isDynamicSchemaNode } from "renderer/nodeEditor/types/Node/DynamicSchemaNode";
import type {
  AreaExtra,
  NodeTypes,
  Schemes,
} from "renderer/nodeEditor/types/Schemes";
import { ClassicPreset, type NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine } from "rete-engine";
import type { HistoryActions, HistoryPlugin } from "rete-history-plugin";
import type { GraphJsonData, InputPortJson } from "shared/JsonType";
import { nodeFactories } from "../../nodes/nodeFactories";
import type { DataflowEngine } from "../safe-dataflow/dataflowEngin";

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
    const nodeDeps = {
      editor,
      area,
      dataflow,
      controlflow,
      history,
    };
    // ノードごとのファクトリを取得
    const factory = nodeFactories[type];
    let node: NodeTypes | null = null;

    if (!factory) {
      console.warn(`Unknown node type: ${type}. Using UnknownNode.`);
      node = nodeFactories.Unknown({
        ...nodeDeps,
        message: `Unknown node type: ${type}`,
      });
    } else {
      // ノードのインスタンスを生成
      node = factory(nodeDeps);
    }
    // ノードの基本設定を設定
    node.id = id;
    await editor.addNode(node);
    node.setSize(size.width, size.height);
    if (size.width && size.height) {
      await area.resize(id, size.width, size.height);
    }
    await area.translate(id, position);

    // ノードにdeserializeControlValueがあり、データがある場合はデータをセット
    if ("deserializeControlValue" in node && data) {
      await node.deserializeControlValue(data as any);
    }

    // ノードにdeserializeInputsがあり、inputsデータがある場合はデータをセット
    if ("deserializeInputs" in node && inputs) {
      node.deserializeInputs(inputs as Record<string, InputPortJson>);
    }

    // ノードのスキーマを更新
    if (isDynamicSchemaNode(node)) {
      await node.setupSchema();
    }
  }

  // ノードの接続を作成
  for (const {
    id,
    source,
    sourcePort,
    target,
    targetPort,
  } of graphJsonData.connections || []) {
    try {
      // 接続元と接続先のノードを取得
      const sourceNode = editor.getNode(source);
      const targetNode = editor.getNode(target);
      if (!sourceNode || !targetNode) {
        console.warn(`Node not found for connection: ${source} -> ${target}`);
        continue;
      }

      // 接続元と接続先のノードに、portが存在するか確認
      // allow dynamic string keys on outputs/inputs
      const sourcePortExists = (sourceNode.outputs as any)[sourcePort];
      const targetPortExists = (targetNode.inputs as any)[targetPort];
      if (!sourcePortExists || !targetPortExists) {
        console.warn(
          `Port not found for connection: ${sourcePort} -> ${targetPort}`
        );
        continue;
      }

      const conn = new ClassicPreset.Connection(
        sourceNode,
        sourcePort as never,
        targetNode,
        targetPort as never
      );
      conn.id = id;
      await editor.addConnection(conn);
    } catch (error) {
      console.error(`Failed to create connection ${id}:`, error);
    }
  }

  // 必要に応じて metadata を扱う
  if (graphJsonData.metadata) {
  }
}
