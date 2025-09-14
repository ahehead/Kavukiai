import {
  contextMenuStructure,
  type MenuItemDefinition,
} from "../../features/contextMenu/menuTree";

// 指定した node の安定ID (typeId = factory meta.typeId = `${namespace}:${op}`) から
// コンテキストメニュー上の階層パス (末尾スラッシュ付き) を返す。
// 例: core:Primitive/String/String のノードで Primitive/String/ のような文字列。
// 見つからない場合は空文字列。
export function getContextMenuPath(typeId: string | undefined): string {
  if (!typeId) return "";
  const findPath = (
    items: MenuItemDefinition[],
    path: string[]
  ): string[] | null => {
    for (const item of items) {
      if (item.typeId === typeId) {
        return path; // path はカテゴリ階層のみ (最終 factory ラベルは含めない)
      }
      const newPath = [...path, item.label];
      if (item.subitems) {
        const result = findPath(item.subitems, newPath);
        if (result) return result;
      }
    }
    return null;
  };

  const fullPath = findPath(contextMenuStructure, []);
  if (!fullPath || fullPath.length === 0) return "";
  return `${fullPath.join("/")}/`;
}
