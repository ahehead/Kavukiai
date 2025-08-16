import { cva } from 'class-variance-authority'
import { ChevronRight, Folder } from 'lucide-react'
import type { FC } from 'react'
import { memo } from 'react'
import type { Item } from 'rete-context-menu-plugin/_types/types'
import type { ContextMenuContextType } from './ContextMenuProvider'
import { hasSub, Menu } from './Menu'
import { SubmenuWrapper } from './SubmenuWrapper'

const menuItemButton = cva(
  'inline-flex w-full gap-1 hover:bg-accent/60 px-1 py-1.25 transition-colors duration-290'
)

export type MenuItemProps = {
  item: Item
  level: number
  isOpen: boolean
  ctx: ContextMenuContextType
  side: 'right' | 'left'
  onHide: () => void
  minMenuWidth: number
  windowHeight: number
  itemHeight: number
}

export const MenuItem: FC<MenuItemProps> = memo(
  ({ item, level, isOpen, side, ctx, ...rest }) => {
    const { onHide, itemHeight, windowHeight, minMenuWidth } = rest
    const hasChildren = hasSub(item)

    return (
      <li role="none" className="relative">
        <button
          type="button"
          role="menuitem"
          aria-haspopup={hasChildren ? 'menu' : undefined}
          aria-expanded={hasChildren ? isOpen : undefined}
          className={menuItemButton()}
          // Block earlier-phase events so underlying canvas/editor won't react
          onPointerDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onKeyDown={(e) => {
            // Prevent leaking Enter/Space handling to parent listeners
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation()
            }
          }}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            item.handler()
            if (!hasChildren) onHide()
          }}
          onPointerEnter={() => ctx.handleEnterMenuItem(level, item)}
          onPointerLeave={ctx.handleLeaveMenu}
        >
          <div className="w-[30px] flex items-center justify-center">
            {hasChildren && (
              <Folder
                className="w-3.5 h-3.5 text-muted-foreground"
                strokeWidth={1}
                aria-hidden="true"
              />
            )}
          </div>
          <span className="flex-1 text-left">{item.label}</span>
          {hasChildren && (
            <ChevronRight
              className="w-[14px] h-[14px] pointer-events-none"
              strokeWidth={0.8}
            />
          )}
        </button>

        {hasChildren && isOpen && (
          <SubmenuWrapper
            side={side}
            onPointerEnter={() => ctx.handleEnterSubmenu()}
            onPointerLeave={ctx.handleLeaveMenu}
            itemCount={item.subitems.length}
            itemHeight={itemHeight}
            windowHeight={windowHeight}
          >
            <Menu
              items={item.subitems}
              level={level + 1}
              side={side}
              minMenuWidth={minMenuWidth}
              windowHeight={windowHeight}
              itemHeight={itemHeight}
              onHide={onHide}
            />
          </SubmenuWrapper>
        )}
      </li>
    )
  }
)
