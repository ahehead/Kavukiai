import type { Schemes } from "renderer/nodeEditor/types/Schemes";
import type { TypedSocket } from "renderer/nodeEditor/types/TypedSocket";
import type { ClassicPreset, NodeEditor } from "rete";

export type Input = ClassicPreset.Input<TypedSocket>;
export type Output = ClassicPreset.Output<TypedSocket>;

export function canCreateConnection(
  source: TypedSocket | undefined,
  target: TypedSocket | undefined
): boolean {
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
  source: TypedSocket | undefined;
  target: TypedSocket | undefined;
} {
  const { output, input } = getConnectionPorts(editor, connection);
  const source = output?.socket as TypedSocket;
  const target = input?.socket as TypedSocket;

  return {
    source,
    target,
  };
}
