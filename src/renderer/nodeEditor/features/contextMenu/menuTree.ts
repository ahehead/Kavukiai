import { getRegisteredFactories } from "renderer/nodeEditor/features/nodeFactory/factoryRegistry";

export interface MenuItemDefinition {
  label: string;
  key: string;
  handler?: () => void;
  typeId?: string; // 安定ID (namespace:name)
  subitems?: MenuItemDefinition[];
}

const generateKey = (label: string): string =>
  label.toLowerCase().replace(/\s+/g, "-");

interface TreeNode {
  children: Map<string, TreeNode>;
  factories: { label: string; typeId: string }[]; // typeId は canonical node type identifier(namespace:name)
}

function buildMenuFromMeta(): MenuItemDefinition[] {
  const root = new Map<string, TreeNode>();
  const rootFactories: { label: string; typeId: string }[] = []; // categories: [] 用 (uncategorized)

  for (const fn of getRegisteredFactories()) {
    const meta = fn.meta;
    if (!meta) continue;
    if (meta.devOnly && process.env.NODE_ENV !== "development") continue;
    const path = meta.categories ?? []; // 空配列ならルート
    const displayLabel =
      meta.label ?? meta.typeId?.split(":").pop() ?? meta.op ?? "Unnamed";
    const typeId = meta.typeId as string;
    if (path.length === 0) {
      rootFactories.push({ label: displayLabel, typeId });
      continue;
    }
    let level = root;
    let node: TreeNode | undefined;
    for (const segment of path) {
      node = level.get(segment);
      if (!node) {
        node = { children: new Map(), factories: [] };
        level.set(segment, node);
      }
      level = node.children;
    }
    if (node) {
      node.factories.push({ label: displayLabel, typeId });
    }
  }

  function build(
    nodes: Map<string, TreeNode>,
    parentPath: string[] = []
  ): MenuItemDefinition[] {
    return [...nodes.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, node]) => {
        const childItems = build(node.children, [...parentPath, label]);
        const factoryItems = node.factories
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((f) => ({
            label: f.label,
            key: generateKey(`${[...parentPath, label, f.typeId].join("-")}`),
            typeId: f.typeId,
          }));
        const subitems = [...childItems, ...factoryItems];
        return {
          label,
          key: generateKey(`${[...parentPath, label].join("-") || label}`),
          subitems: subitems.length ? subitems : undefined,
          typeId: subitems.length ? undefined : undefined, // leaf のみ typeId を持つ
        } satisfies MenuItemDefinition;
      });
  }

  const topLevel = build(root);

  // 並び順: 既存 order を優先し、未定義カテゴリは後ろで名称順。最後に root (空 categories) の items。
  const order = [
    "Primitive",
    "UChat",
    "Inspector",
    "LMStudio",
    "OpenAI",
    "ComfyUI",
    "Debug",
  ];
  topLevel.sort((a, b) => {
    const ia = order.indexOf(a.label);
    const ib = order.indexOf(b.label);
    const ra = ia === -1 ? 999 : ia;
    const rb = ib === -1 ? 999 : ib;
    if (ra !== rb) return ra - rb;
    return a.label.localeCompare(b.label);
  });

  // Root factories (no category path): そのままトップレベルに並べる
  if (rootFactories.length) {
    rootFactories
      .sort((a, b) => a.label.localeCompare(b.label))
      .forEach((f) => {
        topLevel.push({
          label: f.label,
          key: generateKey(`root-${f.typeId}`),
          typeId: f.typeId,
        });
      });
  }

  return topLevel;
}

export const contextMenuStructure = buildMenuFromMeta();
