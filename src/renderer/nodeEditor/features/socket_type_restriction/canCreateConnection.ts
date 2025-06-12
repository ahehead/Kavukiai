import type { Schemes } from "renderer/nodeEditor/types/Schemes";
import type { TypedSocket } from "renderer/nodeEditor/types/TypedSocket";
import type { ClassicPreset, NodeEditor } from "rete";

export type Input = ClassicPreset.Input<TypedSocket>;
export type Output = ClassicPreset.Output<TypedSocket>;

export type SocketPair = {
  source?: TypedSocket;
  target?: TypedSocket;
};

export function canConnect(
  editor: NodeEditor<Schemes>,
  connection: Schemes["Connection"]
): boolean {
  return isCompatible(getConnectionSockets(editor, connection));
}

export function isCompatible({ source, target }: SocketPair): boolean {
  // 両方のソケットが存在し、互換性チェックをパスすれば true
  return !!(source && target && source.isCompatibleWith(target));
}

export function getConnectionPorts(
  editor: NodeEditor<Schemes>,
  connection: Schemes["Connection"]
): {
  input?: Input;
  output?: Output;
} {
  const sourceNode = editor.getNode(connection.source);
  const targetNode = editor.getNode(connection.target);
  if (!sourceNode || !targetNode) {
    return {};
  }

  const output = (sourceNode.outputs as Record<string, Output>)[
    connection.sourceOutput
  ];
  const input = (targetNode.inputs as Record<string, Input>)[
    connection.targetInput
  ];

  return {
    output,
    input,
  };
}

export function getConnectionSockets(
  editor: NodeEditor<Schemes>,
  connection: Schemes["Connection"]
): SocketPair {
  const { output, input } = getConnectionPorts(editor, connection);
  return {
    source: output?.socket,
    target: input?.socket,
  };
}
