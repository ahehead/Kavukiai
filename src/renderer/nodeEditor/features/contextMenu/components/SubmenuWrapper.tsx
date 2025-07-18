import { cva } from 'class-variance-authority'
import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from 'renderer/lib/utils'

const menuContainer = cva(
  'inline-flex flex-col w-fit bg-node-bg shadow-lg text-sm border border-node-border/20 rounded-md'
)

export function MenuContainer({
  children,
  className,
  ...props
}: { children: React.ReactNode } & React.ComponentProps<'ul'>) {
  return (
    <ul
      data-testid="context-menu"
      className={cn(menuContainer(), className)}
      {...props}
    >
      {children}
    </ul>
  )
}

const submenuContainer = cva('transform absolute inline-flex w-fit')
export function SubmenuWrapper({
  children,
  side,
  itemCount,
  itemHeight,
  windowHeight,
  ...props
}: {
  children: React.ReactNode
  side: 'right' | 'left'
  itemCount: number // サブアイテム数
  itemHeight: number // 1アイテムの高さ
  windowHeight: number // ウインドウ全体の高さ
} & React.ComponentProps<'div'>) {
  const ref = useRef<HTMLDivElement>(null)
  const [translateY, setTranslateY] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    // 親アイテムの Y 座標
    const parentRect = el.parentElement?.getBoundingClientRect()
    const submenuHeight = itemCount * itemHeight
    const overflow = (parentRect?.y || 0) + submenuHeight - windowHeight
    if (overflow > 0) {
      setTranslateY(-overflow)
    }
  }, [itemCount, itemHeight, windowHeight])

  // 水平位置だけここで決定
  const horizontalStyle =
    side === 'right' ? { left: '100%' } : { right: '100%' }

  return (
    <div
      ref={ref}
      className={submenuContainer()}
      style={{
        ...horizontalStyle,
        transform: `translateY(${translateY}px)`,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
