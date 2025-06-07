import { type AreaPlugin, Drag } from "rete-area-plugin";
import type { AreaExtra } from "../../types/Schemes";
import type { Schemes } from "../../types/Schemes";

// キーボードの Space 押下状態を保持
let spacePressed = false;
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") spacePressed = true;
});
window.addEventListener("keyup", (e) => {
  if (e.code === "Space") spacePressed = false;
});

export function setupDragPan(area: AreaPlugin<Schemes, AreaExtra>) {
  area.area.setDragHandler(
    new Drag({
      down: (e) => {
        // マウス以外は無効
        if (e.pointerType !== "mouse") return false;

        // 下記いずれかでパンを許可
        // ・中クリック（button===1）／右クリック（button===2）
        // ・左クリック（button===0）＆ Space 押下中
        const ok =
          e.button === 1 || e.button === 2 || (e.button === 0 && spacePressed);

        if (!ok) return false;
        e.preventDefault();
        return true;
      },
      move: () => true,
    })
  );
}
