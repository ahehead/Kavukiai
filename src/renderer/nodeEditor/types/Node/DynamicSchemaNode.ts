import type { TypedSocket } from "../TypedSocket";

export type ConnectionParams = {
  isConnected: boolean; // 接続状態
  source: TypedSocket; // 接続元ソケット
  target: TypedSocket; // 接続先ソケット
};

export interface DynamicSchemaNode {
  onConnectionChangedSchema: (params: ConnectionParams) => Promise<void>;
}
