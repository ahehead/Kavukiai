import type { NodeEditor, ClassicPreset } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine } from "rete-engine";
import type {
  Schemes,
  AreaExtra,
  NodeInterface,
} from "../../../../types/Schemes";
import type { TypedSocket } from "renderer/nodeEditor/types/TypedSocket";
import { removeLinkedSockets } from "../../../../nodes/util/removeNode";
import { resetCacheDataflow } from "renderer/nodeEditor/nodes/util/resetCacheDataflow";
import type { Item } from "rete-context-menu-plugin/_types/types";
import { isDynamicSchemaNode } from "renderer/nodeEditor/types/Node/DynamicSchemaNode";

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
      label: `${input.label ?? key}`,
      key: `${context.id}_${input.id}`,
      async handler() {
        input.showControl = !input.showControl;
        // 接続されているコネクションを削除
        await removeLinkedSockets(editor, context.id, key);
        // dataflowをリセット
        resetCacheDataflow(dataflow, context.id);

        // DynamicSchemaNodeはoutputのSchemaを更新
        if (isDynamicSchemaNode(context)) {
          await context.setupSchema();
        }
        // sizeをリセット
        //context.clearHeight();
        await area.update("node", context.id);
      },
    })),
  };
}

// controlを持っているinputをキー付きでlistで返す
export function filterInputControls(
  inputs: NodeInterface["inputs"]
): Array<{ key: string; input: ClassicPreset.Input<TypedSocket> }> {
  const filtered = Object.entries(inputs).filter(
    ([key, entry]) => entry && entry.control != null
  );
  return filtered.map(
    ([key, input]) =>
      ({ key, input } as {
        key: string;
        input: ClassicPreset.Input<TypedSocket>;
      })
  );
}
