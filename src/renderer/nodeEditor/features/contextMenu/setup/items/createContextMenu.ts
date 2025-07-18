import type { NodeEditor } from "rete";
import type { Item } from "rete-context-menu-plugin/_types/types";
import {
  type MenuItemDefinition,
  type NodeDeps,
  nodeFactories,
} from "../../../../nodes/nodeFactories";
import type { NodeTypeKey, Schemes } from "../../../../types/Schemes";

// Helper function to generate context menu items
export function createReteContextMenuItems(
  definitions: MenuItemDefinition[],
  editor: NodeEditor<Schemes>,
  nodeDepsArgs: NodeDeps,
  pointer: { x: number; y: number }
) {
  return definitions.map((itemDef) => {
    const menuItem: Item = {
      label: itemDef.label,
      key: itemDef.key,
      handler: itemDef.factoryKey
        ? createHandler(itemDef.factoryKey, editor, nodeDepsArgs, pointer)
        : () => void 0,
    };

    if (itemDef.subitems && itemDef.subitems.length > 0) {
      menuItem.subitems = createReteContextMenuItems(
        itemDef.subitems,
        editor,
        nodeDepsArgs,
        pointer
      );
    }
    return menuItem;
  });
}

function createHandler(
  factoryKey: NodeTypeKey,
  editor: NodeEditor<Schemes>,
  nodeDepsArgs: NodeDeps,
  pointer: { x: number; y: number }
): () => Promise<void> {
  return async () => {
    const nodeFactory = nodeFactories[factoryKey];
    if (nodeFactory) {
      const node = nodeFactory(nodeDepsArgs);
      await editor.addNode(node);
      await nodeDepsArgs.area.translate(node.id, pointer);
    } else {
      console.error(`Node factory not found for key: ${factoryKey}`);
    }
  };
}
