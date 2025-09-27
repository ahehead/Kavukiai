import type { AreaExtra, Schemes } from "renderer/nodeEditor/types";
import type { AreaPlugin } from "rete-area-plugin";

export function screenToWorld(
  area: AreaPlugin<Schemes, AreaExtra>,
  clientX: number,
  clientY: number
) {
  const rect = area.container.getBoundingClientRect(); // AreaPluginに渡したコンテナ
  const { x: tx, y: ty, k } = area.area.transform; // 平行移動(tx,ty) と ズーム(k)
  return {
    x: (clientX - rect.left - tx) / k,
    y: (clientY - rect.top - ty) / k,
  };
}
