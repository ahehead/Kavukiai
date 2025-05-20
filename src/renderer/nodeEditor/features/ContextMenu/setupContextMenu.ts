import { ContextMenuPlugin } from "rete-context-menu-plugin";
import type { ClassicPreset, NodeEditor } from "rete";
import type {
  Schemes,
  AreaExtra,
  NodeInterface,
  CustomSocketType,
} from "../../types";

import { contextMenuStructure, type NodeDeps } from "../../nodes/nodeFactories";
import {
  removeLinkedSockets,
  removeNodeWithConnections,
} from "../../nodes/util/removeNode";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine, ControlFlowEngine } from "rete-engine";
import type { HistoryPlugin, HistoryActions } from "rete-history-plugin";
import { createReteContextMenuItems } from "./createContextMenu";
import type { Item } from "rete-context-menu-plugin/_types/types";
import { resetCacheDataflow } from "renderer/nodeEditor/nodes/util/resetCacheDataflow";

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
        listItems.push(deleteConnectionItem(context, editor));
      }
      // nodeとconnection削除機能
      listItems.push(deleteNodeItem(context, editor));
      return {
        searchBar: false,
        list: listItems,
      };
    },
  });
}

function deleteConnectionItem(
  context: { id: string },
  editor: NodeEditor<Schemes>
) {
  return {
    label: "接続を削除",
    key: "delete-connection",
    async handler() {
      await editor.removeConnection(context.id);
    },
  };
}

function deleteNodeItem(context: any, editor: NodeEditor<Schemes>) {
  return {
    label: "ノードを削除",
    key: "delete-node",
    async handler() {
      await removeNodeWithConnections(editor, context.id);
    },
  };
}

// controlを持っているinputをキー付きでlistで返す
function filterInputControls(
  inputs: NodeInterface["inputs"]
): Array<{ key: string; input: ClassicPreset.Input<CustomSocketType> }> {
  const entries = Object.entries(inputs) as [
    string,
    ClassicPreset.Input<CustomSocketType> | undefined
  ][];
  const filtered = entries.filter(
    (entry): entry is [string, ClassicPreset.Input<CustomSocketType>] => {
      const input = entry[1];
      return input?.control != null;
    }
  );
  return filtered.map(([key, input]) => ({ key, input }));
}

export function createToggleInputControlMenuItem(
  context: NodeInterface,
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>,
  dataflow: DataflowEngine<Schemes>,
  inputlist: Array<{
    key: string;
    input: ClassicPreset.Input<CustomSocketType>;
  }>
) {
  return {
    label: "入力方法切替",
    key: "control-style",
    handler: () => void 0,
    subitems: inputlist.map(({ key, input }) => ({
      label: `${key}`,
      key: `${context.id}_${input.id}`,
      async handler() {
        input.showControl = !input.showControl;
        await removeLinkedSockets(editor, context.id, key);
        resetCacheDataflow(dataflow, context.id);
        await area.update("node", context.id);
        console.log(`Toggled showControl for ${key} to ${input.showControl}`);
      },
    })),
  };
}
