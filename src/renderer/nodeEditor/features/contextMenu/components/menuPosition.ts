import type { Item } from "rete-context-menu-plugin/_types/types";

// element と items から { x, y, side } を返すユーティリティ
export function computeMenuPlacement(
  element: HTMLElement,
  items: Item[],
  menuWidth: number,
  itemHeight = 30
): { x: number; y: number; side: "left" | "right" } {
  // エディター画面のサイズを取得
  const editorWindowSize = getEditorWindowSize(element);
  // メニューの高さを計算
  const menuSize = {
    width: menuWidth,
    height: getMenuHeight(items, itemHeight),
  };
  const rect = element.getBoundingClientRect();
  const { x, y } = calcMenuPosition(rect, menuSize, editorWindowSize);
  const side = decideSide(x, menuSize.width, editorWindowSize.width, menuWidth);
  return { x, y, side };
}

export function getEditorWindowSize(element: HTMLElement) {
  const parentElement = element.parentElement?.parentElement?.parentElement;
  if (!parentElement) {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  const rect = parentElement.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}

export function getMenuHeight(items: Item[], itemHeight = 30) {
  return itemHeight * items.length;
}

/**
 * クリック位置（anchor）を基準に、メニューが
 * editor ウインドウ外にはみ出さない座標を返す。
 */
export function calcMenuPosition(
  anchor: { x: number; y: number },
  menuSize: { width: number; height: number },
  editorSize: { width: number; height: number }
): { x: number; y: number } {
  let posX = anchor.x;
  let posY = anchor.y;

  // --- 横方向 ---
  // 右端を超える場合は左にずらす
  if (posX + menuSize.width > editorSize.width) {
    posX = editorSize.width - menuSize.width;
  }
  // 負数対策
  if (posX < 0) posX = 0;

  // --- 縦方向 ---
  // 下端を超える場合は上にずらす
  if (posY + menuSize.height > editorSize.height) {
    posY = editorSize.height - menuSize.height;
  }
  if (posY < 0) posY = 0;

  return { x: posX, y: posY };
}

/**
 * サブメニューを「右に出すか」「左に出すか」を判定。
 *   右側に submenuWidth 分の余裕があれば "right"、
 *   なければ "left"
 */
export function decideSide(
  menuPosX: number,
  menuWidth: number,
  editorWidth: number,
  submenuWidth: number = menuWidth
): "right" | "left" {
  const spaceRight = editorWidth - (menuPosX + menuWidth);
  return spaceRight >= submenuWidth ? "right" : "left";
}

export function computeSubmenuOffset(
  anchorTop: number,
  submenuHeight: number,
  editorHeight: number
) {
  let offset = 0;
  if (anchorTop + submenuHeight > editorHeight) {
    offset = editorHeight - (anchorTop + submenuHeight);
  }
  if (anchorTop + offset < 0) {
    offset = -anchorTop;
  }
  return offset;
}
