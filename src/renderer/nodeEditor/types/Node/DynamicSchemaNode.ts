import type { TypedSocket } from "../TypedSocket";

export interface DynamicSchemaNode {
  onConnectionChangedSchema: (params: {
    isConnected: boolean;
    source: TypedSocket;
    target: TypedSocket;
  }) => Promise<void>;
}
