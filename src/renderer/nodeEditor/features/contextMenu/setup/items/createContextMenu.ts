import type { NodeEditor } from "rete";
import type { Item } from "rete-context-menu-plugin/_types/types";
import {
  type MenuItemDefinition,
  type NodeDeps,
  nodeFactories,
} from "../../../../nodes/nodeFactories";
import type {
  NodeTypeKey,
  NodeTypes,
  Schemes,
} from "../../../../types/Schemes";

// afterCreate フック用の文脈
type AfterCreateContext = {
  node: NodeTypes;
  editor: NodeEditor<Schemes>;
  deps: NodeDeps;
  pointer: { x: number; y: number };
  item: MenuItemDefinition;
};

export type CreateMenuOptions = {
  // ノード生成・配置後に追加処理（接続・グループ追加など）を行いたい場合に利用
  afterCreate?: (ctx: AfterCreateContext) => void | Promise<void>;
};

/**
 * nodeFactoryを使い、各Node用生成MenuItemを作成する
 * @param definitions - Menu item definitions
 * @param editor - Node editor instance
 * @param nodeDepsArgs - Node dependencies
 * @param pointer - Pointer position
 * @returns Array of context menu items
 */
export function createNodeFactoryMenuItems(
  definitions: MenuItemDefinition[],
  editor: NodeEditor<Schemes>,
  nodeDepsArgs: NodeDeps,
  pointer: { x: number; y: number },
  options?: CreateMenuOptions
) {
  return definitions.map((itemDef) => {
    const menuItem: Item = {
      label: itemDef.label,
      key: itemDef.key,
      handler: itemDef.factoryKey
        ? createHandler(itemDef, editor, nodeDepsArgs, pointer, options)
        : () => void 0,
    };

    if (itemDef.subitems && itemDef.subitems.length > 0) {
      menuItem.subitems = createNodeFactoryMenuItems(
        itemDef.subitems,
        editor,
        nodeDepsArgs,
        pointer,
        options
      );
    }
    return menuItem;
  });
}

function createHandler(
  itemDef: MenuItemDefinition,
  editor: NodeEditor<Schemes>,
  nodeDepsArgs: NodeDeps,
  pointer: { x: number; y: number },
  options?: CreateMenuOptions
): () => Promise<void> {
  return async () => {
    const factoryKey = itemDef.factoryKey as NodeTypeKey | undefined;
    if (!factoryKey) return;
    const nodeFactory = nodeFactories[factoryKey];

    if (!nodeFactory) {
      console.error(`Node factory not found for key: ${factoryKey}`);
      return;
    }

    const node = nodeFactory(nodeDepsArgs);
    await editor.addNode(node);
    await nodeDepsArgs.area.translate(node.id, pointer);

    // 生成後フック（接続やグループへの追加などを任意に実施）
    if (options?.afterCreate) {
      try {
        await options.afterCreate({
          node,
          editor,
          deps: nodeDepsArgs,
          pointer,
          item: itemDef,
        });
      } catch (e) {
        console.warn("afterCreate hook failed", e);
      }
    }
  };
}
