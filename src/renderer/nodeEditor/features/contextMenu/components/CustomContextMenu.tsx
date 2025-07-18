import type { ContextMenuRender } from 'rete-react-plugin/_types/presets/context-menu/types'
import { ContextMenuProvider } from './ContextMenuProvider'
import { Menu } from './Menu'
import { computeMenuPlacement } from './menuPosition'

// Menu context provided via ContextMenuProvider

export function CustomContextMenu({
  element,
  items,
  onHide,
}: ContextMenuRender['data']) {
  const menuWidthAndMargin = 250
  const minMenuWidth = 230
  const itemHeight = 30 // アイテムの高さを固定値で設定
  // メニューの配置を計算
  const { x, y, side, windowHeight } = computeMenuPlacement(
    element,
    items,
    menuWidthAndMargin,
    itemHeight
  )

  return (
    <div
      className="inline-flex w-fit"
      style={{
        position: 'fixed',
        left: x,
        top: y,
      }}
    >
      <ContextMenuProvider>
        <Menu
          items={items}
          level={0}
          side={side}
          onHide={onHide}
          minMenuWidth={minMenuWidth}
          windowHeight={windowHeight}
          itemHeight={itemHeight}
        />
      </ContextMenuProvider>
    </div>
  )
}
