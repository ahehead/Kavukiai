import { type AreaPlugin, Drag } from "rete-area-plugin";
import type { AreaExtra, Schemes } from "../../types/Schemes";

// ドラッグするキーの設定
// Spaceキーの押下状態管理＋クリーンアップを返す
export function setupDragPan(area: AreaPlugin<Schemes, AreaExtra>): () => void {
  let spacePressed = false;

  const keydownHandler = (e: KeyboardEvent) => {
    if (e.code === "Space") spacePressed = true;
  };
  const keyupHandler = (e: KeyboardEvent) => {
    if (e.code === "Space") spacePressed = false;
  };

  window.addEventListener("keydown", keydownHandler);
  window.addEventListener("keyup", keyupHandler);

  area.area.setDragHandler(
    new Drag({
      down: (e) => {
        if (e.pointerType !== "mouse") return false;
        // マウスのボタンが中ボタン、右クリック、または左クリックでスペースキーが押されている場合のみドラッグを許可
        const ok =
          e.button === 1 || e.button === 2 || (e.button === 0 && spacePressed);
        if (!ok) return false;
        e.preventDefault();
        return true;
      },
      move: () => true,
    })
  );

  // destroy 時にリスナーを外す
  return () => {
    window.removeEventListener("keydown", keydownHandler);
    window.removeEventListener("keyup", keyupHandler);
  };
}
