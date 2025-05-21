import type { Schemes } from "renderer/nodeEditor/types/Schemes";
import type { NodeSocket } from "renderer/nodeEditor/types/NodeSocket";
import type { ClassicPreset, NodeEditor } from "rete";

export type Input = ClassicPreset.Input<NodeSocket>;
export type Output = ClassicPreset.Output<NodeSocket>;

export function canCreateConnection(
  editor: NodeEditor<Schemes>,
  connection: Schemes["Connection"]
): boolean {
  const { source, target } = getConnectionSockets(editor, connection);
  // 両方のソケットが存在し、互換性チェックをパスすれば true
  return !!(source && target && source.isCompatibleWith(target));
}

export function getConnectionPorts(
  editor: NodeEditor<Schemes>,
  connection: Schemes["Connection"]
): {
  input: Input | undefined;
  output: Output | undefined;
} {
  const source = editor.getNode(connection.source);
  const target = editor.getNode(connection.target);

  const output =
    source &&
    (source.outputs as Record<string, Output>)[connection.sourceOutput];
  const input =
    target && (target.inputs as Record<string, Input>)[connection.targetInput];

  return {
    output,
    input,
  };
}

export function getConnectionSockets(
  editor: NodeEditor<Schemes>,
  connection: Schemes["Connection"]
): {
  source: NodeSocket | undefined;
  target: NodeSocket | undefined;
} {
  const { output, input } = getConnectionPorts(editor, connection);
  const source = output?.socket as NodeSocket;
  const target = input?.socket as NodeSocket;

  return {
    source,
    target,
  };
}
