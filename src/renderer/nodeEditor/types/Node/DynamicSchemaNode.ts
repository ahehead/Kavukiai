import type { TypedSocket } from "../TypedSocket";

export type ConnectionParams = {
  isConnected: boolean; // 接続状態
  source: TypedSocket; // 接続元ソケット
  target: TypedSocket; // 接続先ソケット
};

export interface DynamicSchemaNode {
  // connection時に呼ばれる
  onConnectionChangedSchema: (params: ConnectionParams) => Promise<string[]>;
  // load時や入力切り替え時に呼ばれる
  setupSchema: () => Promise<void>;
}

export function isDynamicSchemaNode(node: any): node is DynamicSchemaNode {
  return (
    typeof node.onConnectionChangedSchema === "function" &&
    typeof node.setupSchema === "function"
  );
}
