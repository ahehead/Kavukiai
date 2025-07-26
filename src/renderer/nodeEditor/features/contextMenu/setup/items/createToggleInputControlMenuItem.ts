import type { DataflowEngine } from "renderer/nodeEditor/features/safe-dataflow/dataflowEngin";
import { isDynamicSchemaNode } from "renderer/nodeEditor/types/Node/DynamicSchemaNode";
import type { TypedSocket } from "renderer/nodeEditor/types/TypedSocket";
import type { ClassicPreset, NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { Item } from "rete-context-menu-plugin/_types/types";
import { removeLinkedSockets } from "../../../../nodes/util/removeNode";
import type {
  AreaExtra,
  NodeInterface,
  Schemes,
} from "../../../../types/Schemes";

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
        dataflow.reset(context.id);

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
    ([_key, entry]) => entry && entry.control != null
  );
  return filtered.map(
    ([key, input]) =>
      ({ key, input } as {
        key: string;
        input: ClassicPreset.Input<TypedSocket>;
      })
  );
}
