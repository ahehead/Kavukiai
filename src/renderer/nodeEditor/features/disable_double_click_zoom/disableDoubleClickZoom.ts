import type { AreaExtra, Schemes } from "renderer/nodeEditor/types/ReteSchemes";
import type { AreaPlugin } from "rete-area-plugin";

export function disableDoubleClickZoom(area: AreaPlugin<Schemes, AreaExtra>) {
  area.addPipe((context) => {
    // ダブルクリックによるズームをガード。無効化
    if (context.type === "zoom" && context.data.source === "dblclick")
      return undefined;
    return context;
  });
}
