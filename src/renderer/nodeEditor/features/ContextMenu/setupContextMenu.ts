import { ContextMenuPlugin } from "rete-context-menu-plugin";
import type { NodeEditor } from "rete";
import type { Schemes, AreaExtra } from "../../types";
import { createReteContextMenuItems } from "./createContextMenu";
import { contextMenuStructure, type NodeDeps } from "../../nodes/nodeFactories";
import { removeNodeWithConnections } from "../../nodes/util/removeNode";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine, ControlFlowEngine } from "rete-engine";
import type { HistoryPlugin, HistoryActions } from "rete-history-plugin";

type ContextMenuDependencies = {
  editor: NodeEditor<Schemes>;
  area: AreaPlugin<Schemes, AreaExtra>;
  dataflow: DataflowEngine<Schemes>;
  controlflow: ControlFlowEngine<Schemes>;
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>;
};

export function setupContextMenu({
  editor,
  area,
  dataflow,
  controlflow,
  history,
}: ContextMenuDependencies) {
  return new ContextMenuPlugin<Schemes>({
    items: (context) => {
      console.log("context", context);
      const nodeDeps: NodeDeps = { area, dataflow, controlflow, history };

      if (context === "root") {
        return {
          searchBar: true,
          list: createReteContextMenuItems(
            contextMenuStructure,
            editor,
            nodeDeps
          ),
        };
      }
      return {
        searchBar: false,
        list: [
          {
            label: "Delete",
            key: "delete",
            async handler() {
              if ("source" in context && "target" in context) {
                // connection
                await editor.removeConnection(context.id);
              } else {
                // node
                await removeNodeWithConnections(editor, context.id);
              }
            },
          },
        ],
      };
    },
  });
}
