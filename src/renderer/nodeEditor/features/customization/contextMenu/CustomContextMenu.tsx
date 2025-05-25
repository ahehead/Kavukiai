
import type { Item } from "rete-context-menu-plugin/_types/types";
import type { ContextMenuRender } from "rete-react-plugin/_types/presets/context-menu/types";
import { computeMenuPlacement } from "./menuPosition";
import { useContextMenu } from "./useContextMenu";

export function CustomContextMenu({ element, type, items, searchBar, onHide }: ContextMenuRender["data"]) {

  const menuWidth = 200; // メニューの幅を固定値で設定
  // メニューの配置を計算
  const { x, y, side } = computeMenuPlacement(element, items, menuWidth)

  return (
    <div
      style={{ position: "fixed", left: x, top: y }}
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
    <div
      data-testid="context-menu"
      className="bg-node-bg w-[200px] shadow-lg text-sm"
    >
      {/* items */}
      {items.map(item => {
        return (
          // item
          // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
          <div
            data-testid="context-menu-item"
            className="bg-node-bg hover:bg-accent/60 px-1 relative  transition-colors duration-290 delay-50"
            key={item.key}
            onClick={() => { item.handler(); onHide(); }}
            onPointerEnter={() => handleEnterMenuItem(item)}
            onPointerLeave={handleLeaveMenuItem}
          >
            {item.label}
            {item.subitems && viewSubmenu && viewSubmenu.key === item.key && (
              <div
                onPointerEnter={() => handleEnterSubmenu(item)}
                onPointerLeave={handleLeaveMenuItem}
                // 横に表示
                className={`absolute ${side === "right" ? "left-[200px]" : "right-[200px]"} top-0`}
              >
                <Menu
                  items={item.subitems}
                  side={side}
                  onHide={onHide}
                  menuWidth={menuWidth}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


