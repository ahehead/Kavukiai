import type { CustomSocketType, Schemes } from "renderer/nodeEditor/types";
import type { ClassicPreset, NodeEditor } from "rete";

export type Input = ClassicPreset.Input<CustomSocketType>;
export type Output = ClassicPreset.Output<CustomSocketType>;

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
  source: CustomSocketType | undefined;
  target: CustomSocketType | undefined;
} {
  const { output, input } = getConnectionPorts(editor, connection);
  const source = output?.socket as CustomSocketType;
  const target = input?.socket as CustomSocketType;

  return {
    source,
    target,
  };
}
