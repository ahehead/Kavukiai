
import { useRef, useState } from "react";
import type { Item } from "rete-context-menu-plugin/_types/types";
import type { ContextMenuRender } from "rete-react-plugin/_types/presets/context-menu/types";

//　開く方向 右下、 左下、右上、左上
export type ContextMenuPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";

export function CustomContextMenu({ element, type, items, searchBar, onHide }: ContextMenuRender["data"]) {
  // const [searchQuery, setSearchQuery] = useState("");

  // const filtered = useMemo(() => filterItems(items, searchQuery), [items, searchQuery]);

  // const { x, y } = element.getBoundingClientRect();
  // console.log("CustomContextMenu position", { x, y });

  return (
    <div>
      <Menu
        items={items}
        openPosition="bottom-right"
        onHide={onHide}
      />
    </div>
  );
}

export function Menu({
  items,
  openPosition,
  onHide }: {
    items: Item[];
    openPosition: ContextMenuPosition;
    onHide: () => void
  }) {
  const [viewSubmenu, setViewSubmenu] = useState<{ key: string } | false>(false);
  const submenuOpenDelay = 500;// itemの上でサブメニュー表示までの遅延時間

  const currentPointerKey = useRef<string | null>(null);// 現在pointerがあるアイテムのkey

  const subMenuOpenTimerRef = useRef<number | null>(null);
  const submenuCloseTimerRef = useRef<number | null>(null);

  const closeSubmenuTime = 1000;  // サブメニューが閉じるまでの時間

  function handleEnterMenuItem(item: Item) {
    // 前のタイマーをリセット
    if (subMenuOpenTimerRef.current) {
      clearTimeout(subMenuOpenTimerRef.current);
    }
    // 現在のポインターキーを更新
    currentPointerKey.current = item.key;
    // 時間をカウント
    subMenuOpenTimerRef.current = window.setTimeout(() => {
      // ポインターが離れていない場合、サブメニューを表示
      if (currentPointerKey.current === item.key) {
        setViewSubmenu({ key: item.key });
      }
    }, submenuOpenDelay);
  }

  function handleEnterSubmenu(item: Item) {
    // サブメニューに入ったときは、現在のポインターキーを更新
    currentPointerKey.current = item.key;
  }

  function handleLeaveMenuItem() {
    // 前のタイマーをリセット
    if (subMenuOpenTimerRef.current) {
      clearTimeout(subMenuOpenTimerRef.current);
      subMenuOpenTimerRef.current = null;
    }
    if (submenuCloseTimerRef.current) {
      clearTimeout(submenuCloseTimerRef.current);
    }
    // ポインターが離れたら、現在のポインターキーをリセット
    currentPointerKey.current = null;
    // 一定期間後のサブメニュー閉じ処理
    submenuCloseTimerRef.current = window.setTimeout(() => {
      if (!currentPointerKey.current) {
        setViewSubmenu(false);
      }
    }, closeSubmenuTime);
  }



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
            className="hover:bg-accent/80 px-1 relative"
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
                className='absolute left-[200px] top-0'
              >
                <Menu items={item.subitems} openPosition={openPosition} onHide={onHide} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}




function filterItems(list: Item[], q: string): Item[] {
  if (!q) return list;
  const lower = q.toLowerCase();

  return list
    .map((item) => {
      const hit =
        item.label.toLowerCase().includes(lower) ||
        item.key.toLowerCase().includes(lower);

      const sub = item.subitems && filterItems(item.subitems, q);
      if (hit || (sub && sub.length > 0)) {
        return { ...item, subitems: sub };
      }
      return null;
    })
    .filter(Boolean) as Item[];
}

