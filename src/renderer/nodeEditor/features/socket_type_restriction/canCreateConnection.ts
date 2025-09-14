import type { Connection, TooltipInput } from "renderer/nodeEditor/types";
import type {
  NodeInterface,
  Schemes,
} from "renderer/nodeEditor/types/ReteSchemes";
import type { TypedSocket } from "renderer/nodeEditor/types/Socket/TypedSocket";
import type { NodeEditor } from "rete";

export type Input = TooltipInput<TypedSocket>;
export type Output = TooltipInput<TypedSocket>;

export type SocketPair = {
  source?: TypedSocket;
  target?: TypedSocket;
};

export function canConnect(
  editor: NodeEditor<Schemes>,
  connection: Schemes["Connection"]
): boolean {
  return isCompatible(getConnectedSockets(editor, connection));
}

export function isCompatible({ source, target }: SocketPair): boolean {
  // 両方のソケットが存在し、互換性チェックをパスすれば true
  return !!(source && target && source.isCompatibleWith(target));
}

// コネクションから双方のportのペアを取得,双方揃っていないとundefined
export function getConnectionPorts(
  editor: NodeEditor<Schemes>,
  connection: Connection<NodeInterface, NodeInterface>
): {
  sourcePort?: TooltipInput<TypedSocket>;
  targetPort?: TooltipInput<TypedSocket>;
} {
  const sourceNode = editor.getNode(connection.source);
  const targetNode = editor.getNode(connection.target);
  if (!sourceNode || !targetNode) {
    return {};
  }

  const sourcePort = (
    sourceNode.outputs as Record<string, TooltipInput<TypedSocket>>
  )[connection.sourceOutput];
  const targetPort = (
    targetNode.inputs as Record<string, TooltipInput<TypedSocket>>
  )[connection.targetInput];

  return {
    sourcePort,
    targetPort,
  };
}

// コネクションから双方のsocketのペアを取得
export function getConnectedSockets(
  editor: NodeEditor<Schemes>,
  connection: Connection<NodeInterface, NodeInterface>
): SocketPair {
  const { sourcePort, targetPort } = getConnectionPorts(editor, connection);
  return {
    source: sourcePort?.socket,
    target: targetPort?.socket,
  };
}

export function getConnectionSockets(
  editor: NodeEditor<Schemes>,
  connection: Connection<NodeInterface, NodeInterface>
) {
  const source = editor.getNode(connection.source);
  const target = editor.getNode(connection.target);

  const output =
    source &&
    (source.outputs as Record<string, Input>)[connection.sourceOutput];
  const input =
    target && (target.inputs as Record<string, Output>)[connection.targetInput];

  return {
    source: output?.socket,
    target: input?.socket,
  };
}
