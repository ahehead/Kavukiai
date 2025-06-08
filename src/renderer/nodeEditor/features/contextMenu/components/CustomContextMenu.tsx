
import type { Item } from "rete-context-menu-plugin/_types/types";
import type { ContextMenuRender } from "rete-react-plugin/_types/presets/context-menu/types";

import { MenuContainer, MenuItemContainer, SubmenuWrapper } from "./ContextMenuPresentaitional";
import { ChevronRight } from 'lucide-react';
import { computeMenuPlacement } from "./menuPosition";
import { useContextMenu } from "./useContextMenu";

export function CustomContextMenu({ element, type, items, searchBar, onHide }: ContextMenuRender["data"]) {

  const menuWidth = 230; // メニューの幅を固定値で設定
  const itemHeight = 30; // アイテムの高さを固定値で設定
  // メニューの配置を計算
  const { x, y, side } = computeMenuPlacement(element, items, menuWidth, itemHeight);

  return (
    <div
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
        menuWidth={menuWidth}
      />
    </div>
  );
}

export function Menu({
  items,
  side,
  onHide,
  menuWidth
}: {
  items: Item[];
  side: "right" | "left";
  onHide: () => void
  menuWidth: number;
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
      width={menuWidth}
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
            <div className="col-start-2 col-span-4">
              {item.label}
            </div>
            {item.subitems && (
              <div className="flex justify-end items-center mr-1">
                <ChevronRight className="w-[14px] h-[14px]" strokeWidth={0.8} />
              </div>
            )}
            {item.subitems && viewSubmenu && viewSubmenu.key === item.key && (
              <SubmenuWrapper
                side={side}
                width={menuWidth}
                onPointerEnter={() => handleEnterSubmenu(item)}
                onPointerLeave={handleLeaveMenuItem}
              >
                <Menu
                  items={item.subitems}
                  side={side}
                  onHide={onHide}
                  menuWidth={menuWidth}
                />
              </SubmenuWrapper>
            )}
          </MenuItemContainer>
        );
      })}
    </MenuContainer>
  );
}


