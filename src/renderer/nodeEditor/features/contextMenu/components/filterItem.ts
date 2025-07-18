import type { Item } from "rete-context-menu-plugin/_types/types";

function _filterItems(list: Item[], q: string): Item[] {
  if (!q) return list;
  const lower = q.toLowerCase();

  return list
    .map((item) => {
      const hit =
        item.label.toLowerCase().includes(lower) ||
        item.key.toLowerCase().includes(lower);

      const sub = item.subitems && _filterItems(item.subitems, q);
      if (hit || (sub && sub.length > 0)) {
        return { ...item, subitems: sub };
      }
      return null;
    })
    .filter(Boolean) as Item[];
}
