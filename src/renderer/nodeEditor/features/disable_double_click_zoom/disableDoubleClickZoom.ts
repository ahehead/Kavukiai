import type { AreaExtra, Schemes } from "renderer/nodeEditor/types/Schemes";
import type { AreaPlugin } from "rete-area-plugin";

export function disableDoubleClickZoom(area: AreaPlugin<Schemes, AreaExtra>) {
  area.addPipe((context) => {
    if (context.type === "zoom" && context.data.source === "dblclick") return;
    return context;
  });
}
