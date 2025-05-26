import type { NodeEditor, ClassicPreset } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine } from "rete-engine";
import type { Schemes, AreaExtra, NodeInterface } from "../../../types/Schemes";
import type { TypedSocket } from "renderer/nodeEditor/types/TypedSocket";
import { removeLinkedSockets } from "../../../nodes/util/removeNode";
import { resetCacheDataflow } from "renderer/nodeEditor/nodes/util/resetCacheDataflow";
import type { Item } from "rete-context-menu-plugin/_types/types";

export function createToggleInputControlMenuItem(
  context: NodeInterface,
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>,
  dataflow: DataflowEngine<Schemes>,
  inputlist: Array<{
    key: string;
    input: ClassicPreset.Input<TypedSocket>;
  }>
): Item {
  return {
    label: "入力方法切替",
    key: "control-style",
    handler: () => void 0,
    subitems: inputlist.map(({ key, input }) => ({
      label: `${key}`,
      key: `${context.id}_${input.id}`,
      async handler() {
        input.showControl = !input.showControl;
        // 接続されているコネクションを削除
        await removeLinkedSockets(editor, context.id, key);
        // dataflowをリセット
        resetCacheDataflow(dataflow, context.id);
        // sizeをリセット
        //context.clearHeight();
        await area.update("node", context.id);
        console.log(`Toggled showControl for ${key} to ${input.showControl}`);
      },
    })),
  };
}

// controlを持っているinputをキー付きでlistで返す
export function filterInputControls(
  inputs: NodeInterface["inputs"]
): Array<{ key: string; input: ClassicPreset.Input<TypedSocket> }> {
  const entries = Object.entries(inputs) as [
    string,
    ClassicPreset.Input<TypedSocket> | undefined
  ][];
  const filtered = entries.filter(
    (entry): entry is [string, ClassicPreset.Input<TypedSocket>] => {
      const input = entry[1];
      return input?.control != null;
    }
  );
  return filtered.map(([key, input]) => ({ key, input }));
}
