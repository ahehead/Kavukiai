
import type { Item } from "rete-context-menu-plugin/_types/types";
import type { ContextMenuRender } from "rete-react-plugin/_types/presets/context-menu/types";

import { MenuContainer, SubmenuWrapper } from "./ContextMenuPresentaitional";
import { ChevronRight } from 'lucide-react';
import { computeMenuPlacement } from "./menuPosition";
import { useContextMenu } from "./useContextMenu";
import { cva } from "class-variance-authority";
import { createContext, useContext } from "react";

const MenuCtx = createContext<ReturnType<typeof useContextMenu> | null>(null);

export function CustomContextMenu({ element, items, onHide }: ContextMenuRender["data"]) {

  const menuWidthAndMargin = 250
  const minMenuWidth = 230;
  const itemHeight = 30; // アイテムの高さを固定値で設定
  // メニューの配置を計算
  const { x, y, side, windowHeight } = computeMenuPlacement(element, items, menuWidthAndMargin, itemHeight);

  const menuState = useContextMenu();

  return (
    <div
      className="inline-flex w-fit"
      style={{
        position: "fixed",
        left: x,
        top: y
      }}
    >
      <MenuCtx.Provider value={menuState}>
        <Menu
          items={items}
          level={0}
          side={side}
          onHide={onHide}
          minMenuWidth={minMenuWidth}
          windowHeight={windowHeight}
          itemHeight={itemHeight}
        />
      </MenuCtx.Provider>
    </div>
  );
}

type MenuProps = {
  items: Item[];
  level: number; // レベル（サブメニューの深さ）
  side: "right" | "left";
  onHide: () => void
  minMenuWidth: number;
  windowHeight: number;
  itemHeight: number; // アイテムの高さ（オプション）
}

export function Menu({
  items,
  level,
  side,
  onHide,
  minMenuWidth,
  windowHeight,
  itemHeight
}: MenuProps) {
  const ctx = useContext(MenuCtx);


  return (
    // menu
    <MenuContainer
      onPointerLeave={ctx?.handleLeaveMenuItem}
      style={{ minWidth: minMenuWidth }}
    >
      {items.map((item) => {

        const hasSub = (item: Item): item is Item & { subitems: Item[] } => !!item.subitems && item.subitems.length > 0;
        const isOpen = ctx?.viewSubmenu[level] === item.key;

        return (
          <li
            key={item.key}
            role="none"
            className="relative">
            <button
              type="button"
              role="menuitem"
              aria-haspopup={hasSub(item) ? "menu" : undefined}
              aria-expanded={hasSub(item) ? isOpen : undefined}
              className={menuItemButton()}
              onClick={() => {
                item.handler();
                if (!hasSub(item)) onHide();
              }}
              onPointerEnter={() => ctx?.handleEnterMenuItem(level, item)}
              onPointerLeave={ctx?.handleLeaveMenuItem}
            >
              <div className="w-[30px]">{/* アイコンなど */}</div>
              <span className="flex-1 text-left">{item.label}</span>
              {hasSub(item) && (
                <ChevronRight className="w-[14px] h-[14px] pointer-events-none" strokeWidth={0.8} />
              )}
            </button>

            {hasSub(item) && isOpen && (
              <SubmenuWrapper
                side={side}
                onPointerEnter={() => ctx?.handleEnterSubmenu()}
                onPointerLeave={ctx?.handleLeaveMenuItem}
                itemCount={item.subitems.length}
                itemHeight={itemHeight}
                windowHeight={windowHeight}
              >
                <Menu
                  items={item.subitems}
                  level={level + 1}
                  side={side}
                  onHide={onHide}
                  minMenuWidth={minMenuWidth}
                  windowHeight={windowHeight}
                  itemHeight={itemHeight}
                />
              </SubmenuWrapper>
            )}
          </li>
        )
      })}
    </MenuContainer>
  );
}

const menuItemButton = cva(
  "inline-flex w-full gap-1 hover:bg-accent/60 px-1 py-1.25 transition-colors duration-290"
);



