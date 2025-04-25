import type { Schemes } from "renderer/nodeEditor/types";
import type { ClassicPreset, NodeEditor } from "rete";

import type { StringSocket, ExecSocket } from "../../nodes/Sockets";

export type Input = ClassicPreset.Input<SocketType>;
export type Output = ClassicPreset.Output<SocketType>;

type SocketType = StringSocket | ExecSocket;

export function canCreateConnection(
  editor: NodeEditor<Schemes>,
  connection: Schemes["Connection"]
): boolean {
  const { source, target } = getConnectionSockets(editor, connection);
  // 両方のソケットが存在し、互換性チェックをパスすれば true
  return !!(source && target && source.isCompatibleWith(target));
}

export function getConnectionSockets(
  editor: NodeEditor<Schemes>,
  connection: Schemes["Connection"]
): { source: SocketType | undefined; target: SocketType | undefined } {
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
