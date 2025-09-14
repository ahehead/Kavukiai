// Control views are now sourced from the central registry.
import { controlViews } from "renderer/nodeEditor/nodes/Controls/registry";
import {
  CustomExecSocket,
  CustomSocket,
  createCustomNode,
} from "renderer/nodeEditor/nodes/components";
import {
  CustomDataConnection,
  CustomExecConnection,
} from "renderer/nodeEditor/nodes/components/CustomConnection";
import type {
  AreaExtra,
  Connection,
  NodeInterface,
  Schemes,
} from "renderer/nodeEditor/types";
import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { HistoryPlugin } from "rete-history-plugin";
import { Presets as ReactPresets } from "rete-react-plugin";
import { getConnectionSockets } from "../socket_type_restriction/canCreateConnection";

type Ctor<T = any> = new (...a: any[]) => T;

// controlViews は registry.ts から取得

export function customReactPresets(
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>,
  history: HistoryPlugin<Schemes>
) {
  // Use any-cast to bypass complex TS types for Rete React Presets
  return (ReactPresets.classic as any).setup({
    customize: {
      connection: (_data: {
        payload: Connection<NodeInterface, NodeInterface>;
      }) => {
        const { source, target } = getConnectionSockets(editor, _data.payload);
        if (source?.isExec || target?.isExec) {
          return CustomExecConnection;
        }
        return CustomDataConnection;
      },
      socket: (data: any) => {
        return data.payload?.isExec ? CustomExecSocket : CustomSocket;
      },
      control: (data: any) => {
        const payload = data.payload as { constructor: Ctor };
        // Cast constructor to index signature acceptable for Map lookup
        return controlViews.get(payload.constructor) ?? null;
      },
      node: () => createCustomNode(area, history),
    },
  });
}
