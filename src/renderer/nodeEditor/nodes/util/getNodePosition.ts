import type { AreaExtra, NodeTypes, Schemes } from "renderer/nodeEditor/types";
import type { AreaPlugin } from "rete-area-plugin";

/**
 * node から position を取り出す関数（Area の nodeViews を参照）
 * 見つからない場合は null を返す
 */

export function getNodePosition(
  area: AreaPlugin<Schemes, AreaExtra>,
  node: NodeTypes
): { x: number; y: number } | null {
  const view = area.nodeViews.get(node.id);
  if (!view) return null;
  return { x: view.position.x, y: view.position.y };
}
