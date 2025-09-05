import { ClassicFlow, getSourceTarget } from "rete-connection-plugin";
import { Connection, type NodeInterface } from "../../types";

/**
 * ConnectionPlugin に addPreset するためのファクトリ
 * usage: connection.addPreset(customClassicFlowPreset());
 */
export function customClassicFlowPreset() {
  return () =>
    new ClassicFlow({
      makeConnection(from, to, context) {
        const [source, target] = getSourceTarget(from, to) || [null, null];
        const { editor } = context;

        if (source && target) {
          const sourceNode = editor.getNode(source.nodeId);
          const targetNode = editor.getNode(target.nodeId);
          if (!sourceNode || !targetNode) return false;

          editor.addConnection(
            new Connection(
              sourceNode as unknown as NodeInterface,
              source.key as never,
              targetNode as unknown as NodeInterface,
              target.key as never
            ) as Connection<NodeInterface, NodeInterface>
          );
          return true; // 接続が正常に追加されたことを示す
        }
      },
    });
}
