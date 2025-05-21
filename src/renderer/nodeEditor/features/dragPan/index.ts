import { type AreaPlugin, Drag } from "rete-area-plugin";
import type { AreaExtra } from "../../types/Schemes";
import type { Schemes } from "../../types/Schemes";

export function setupDragPan(area: AreaPlugin<Schemes, AreaExtra>) {
  area.area.setDragHandler(
    new Drag({
      down: (e) => {
        // マウス（左クリック：0, 中クリック：1）でのみパンを許可
        if (e.pointerType === "mouse" && e.button !== 0 && e.button !== 1)
          return false;
        e.preventDefault();
        return true;
      },
      move: () => true,
    })
  );
}
