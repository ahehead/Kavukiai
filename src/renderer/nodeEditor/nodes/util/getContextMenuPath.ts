import type { NodeTypeKey } from "../../types";
import {
  contextMenuStructure,
  type MenuItemDefinition,
} from "../nodeFactories";

// returns hierarchy path for a given factoryKey; e.g., "String" -> "Primitive/String"

export function getContextMenuPath(factoryKey: NodeTypeKey): string {
  // recursive helper to collect path of labels
  const findPath = (
    items: MenuItemDefinition[],
    path: string[]
  ): string[] | null => {
    for (const item of items) {
      if (item.factoryKey === factoryKey) {
        return path;
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
  if (!fullPath) return "";
  return fullPath.join("/");
}
