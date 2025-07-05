
import type { Item } from "rete-context-menu-plugin/_types/types";
import type { ContextMenuRender } from "rete-react-plugin/_types/presets/context-menu/types";

import { MenuContainer, MenuItemContainer, SubmenuWrapper } from "./ContextMenuPresentaitional";
import { ChevronRight } from 'lucide-react';
import { computeMenuPlacement } from "./menuPosition";
import { useContextMenu } from "./useContextMenu";

export function CustomContextMenu({ element, type, items, searchBar, onHide }: ContextMenuRender["data"]) {

  const menuWidthAndMargin = 250
  const minMenuWidth = 230;
  const itemHeight = 30; // アイテムの高さを固定値で設定
  // メニューの配置を計算
  const { x, y, side, windowHeight } = computeMenuPlacement(element, items, menuWidthAndMargin, itemHeight);

  return (
    <div
      className="inline-flex w-fit"
      style={{
        position: "fixed",
        left: x,
        top: y
      }}
    >
      <Menu
        items={items}
        side={side}
        onHide={onHide}
        minMenuWidth={minMenuWidth}
        windowHeight={windowHeight}
        itemHeight={itemHeight}
      />
    </div>
  );
}

export function Menu({
  items,
  side,
  onHide,
  minMenuWidth,
  windowHeight,
  itemHeight
}: {
  items: Item[];
  side: "right" | "left";
  onHide: () => void
  minMenuWidth: number;
  windowHeight: number;
  itemHeight: number; // アイテムの高さ（オプション）
}) {

  const {
    viewSubmenu,
    handleEnterMenuItem,
    handleEnterSubmenu,
    handleLeaveMenuItem,
  } = useContextMenu();


  return (
    // menu
    <MenuContainer
      style={{ minWidth: minMenuWidth }}
    >
      {/* items */}
      {items.map(item => {
        return (
          // item
          <MenuItemContainer
            key={item.key}
            onClick={() => { item.handler(); if (!item.subitems) onHide(); }}
            onPointerEnter={() => handleEnterMenuItem(item)}
            onPointerLeave={handleLeaveMenuItem}
          >
            <div className="w-[30px]">
              {/* アイコンなど */}
            </div>
            {/* ラベル */}
            <div className="flex-1 inline-block w-fit">
              {item.label}
            </div>
            {/* サブアイテムがある場合の矢印 */}
            {item.subitems && (
              <div className="flex items-center mr-1">
                <ChevronRight className="w-[14px] h-[14px]" strokeWidth={0.8} />
              </div>
            )}
            {item.subitems && viewSubmenu && viewSubmenu.key === item.key && (
              <SubmenuWrapper
                side={side}
                onPointerEnter={() => handleEnterSubmenu(item)}
                onPointerLeave={handleLeaveMenuItem}
                itemCount={item.subitems.length}
                itemHeight={itemHeight}
                windowHeight={windowHeight}
              >
                <Menu
                  items={item.subitems}
                  side={side}
                  onHide={onHide}
                  minMenuWidth={minMenuWidth}
                  windowHeight={windowHeight}
                  itemHeight={itemHeight}
                />
              </SubmenuWrapper>
            )}
          </MenuItemContainer>
        );
      })}
    </MenuContainer>
  );
}


