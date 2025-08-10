import type { NodeTypes } from "renderer/nodeEditor/types";
import { isDynamicSchemaNode } from "renderer/nodeEditor/types/Node/DynamicSchemaNode";
import { ClassicPreset } from "rete";
import type { GraphJsonData, InputPortJson } from "shared/JsonType";
import { type NodeDeps, nodeFactories } from "../../nodes/nodeFactories";

// JSON からノードを生成してエディタに登録
export type DeserializeGraphArgs = NodeDeps & {
  graphJsonData: GraphJsonData;
};
export async function deserializeGraphIntoEditor({
  graphJsonData,
  area,
  editor,
  dataflow,
  controlflow,
  history,
}: DeserializeGraphArgs): Promise<void> {
  // ノードの登録
  for (const {
    id,
    type,
    position,
    size,
    data,
    inputs,
  } of graphJsonData.nodes) {
    const nodeDeps: NodeDeps = {
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

    // 最後にノードの基本設定を設定、描画の変更
    node.id = id;
    await editor.addNode(node);
    node.setSize(size.width, size.height);
    if (size.width && size.height) {
      await area.resize(id, size.width, size.height);
    }
    await area.translate(id, position);
  }

  // ノードの接続を作成
  for (const {
    id,
    source,
    sourceOutput,
    target,
    targetInput,
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
      const sourcePortExists = (sourceNode.outputs as any)[sourceOutput];
      const targetPortExists = (targetNode.inputs as any)[targetInput];
      if (!sourcePortExists || !targetPortExists) {
        console.warn(
          `Port not found for connection: ${sourceOutput} -> ${targetInput}`
        );
        continue;
      }

      const conn = new ClassicPreset.Connection(
        sourceNode,
        sourceOutput as never,
        targetNode,
        targetInput as never
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
