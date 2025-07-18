import type { Item } from 'rete-context-menu-plugin/_types/types'
import { useMenuContext } from './ContextMenuProvider'
import { MenuItem } from './MenuItem'
import { MenuContainer } from './SubmenuWrapper'

export const hasSub = (item: Item): item is Item & { subitems: Item[] } =>
  !!item.subitems && item.subitems.length > 0

export type MenuProps = {
  items: Item[]
  level: number // レベル（サブメニューの深さ）
  side: 'right' | 'left'
  onHide: () => void
  minMenuWidth: number
  windowHeight: number
  itemHeight: number // アイテムの高さ（オプション）
}

export function Menu({
  items,
  level,
  side,
  onHide,
  minMenuWidth,
  windowHeight,
  itemHeight,
}: MenuProps) {
  const ctx = useMenuContext()

  return (
    <MenuContainer
      onPointerLeave={ctx.handleLeaveMenu}
      style={{ minWidth: minMenuWidth }}
    >
      {items.map(item => {
        const isOpen = ctx.viewSubmenu[level] === item.key

        return (
          <MenuItem
            key={item.key}
            item={item}
            level={level}
            isOpen={isOpen}
            ctx={ctx}
            side={side}
            onHide={onHide}
            minMenuWidth={minMenuWidth}
            windowHeight={windowHeight}
            itemHeight={itemHeight}
          />
        )
      })}
    </MenuContainer>
  )
}
