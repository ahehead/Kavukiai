import { ContextMenuPlugin } from "rete-context-menu-plugin";
import type { NodeEditor } from "rete";
import type { Schemes, AreaExtra, NodeInterface } from "../../types/Schemes";

import { contextMenuStructure, type NodeDeps } from "../../nodes/nodeFactories";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine, ControlFlowEngine } from "rete-engine";
import type { HistoryPlugin, HistoryActions } from "rete-history-plugin";
import { createReteContextMenuItems } from "./items/createContextMenu";
import {
  createToggleInputControlMenuItem,
  filterInputControls,
} from "./items/createToggleInputControlMenuItem";
import type { Item } from "rete-context-menu-plugin/_types/types";
import { createDeleteConnectionItem } from "./items/createDeleteConnectionItem";
import { createDeleteNodeItem } from "./items/createDeleteNodeItem";

type ContextMenuDependencies = {
  editor: NodeEditor<Schemes>;
  area: AreaPlugin<Schemes, AreaExtra>;
  dataflow: DataflowEngine<Schemes>;
  controlflow: ControlFlowEngine<Schemes>;
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>;
};

function isConnection(
  ctx: any
): ctx is { id: string; source: string; target: string } {
  return ctx && typeof ctx === "object" && "source" in ctx && "target" in ctx;
}

function isNode(ctx: any): ctx is NodeInterface {
  return ctx && typeof ctx === "object" && "id" in ctx && "inputs" in ctx;
}

export function setupContextMenu({
  editor,
  area,
  dataflow,
  controlflow,
  history,
}: ContextMenuDependencies) {
  const nodeDeps: NodeDeps = { area, dataflow, controlflow, history };

  return new ContextMenuPlugin<Schemes>({
    items: (context) => {
      //console.log("context", context);

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

      const listItems: Item[] = [];

      // node のinputにcontrolがある場合、showControlをtoggleするメニューを追加
      if (isNode(context)) {
        // 表示方式を変えられるinputのリスト
        const inputlist = filterInputControls(context.inputs);
        if (inputlist.length > 0) {
          listItems.push(
            createToggleInputControlMenuItem(
              context,
              editor,
              area,
              dataflow,
              inputlist
            )
          );
        }
      }

      if (isConnection(context)) {
        // 接続削除機能
        listItems.push(createDeleteConnectionItem(context, editor));
      }
      // node削除機能
      listItems.push(createDeleteNodeItem(context, editor));
      return {
        searchBar: false,
        list: listItems,
      };
    },
  });
}
