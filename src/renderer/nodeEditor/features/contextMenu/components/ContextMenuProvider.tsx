import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'
import { useContextMenu } from './useContextMenu'

export type ContextMenuContextType = ReturnType<typeof useContextMenu>

export const MenuCtx = createContext<ContextMenuContextType | null>(null)

type ContextMenuProviderProps = {
  children: ReactNode
}

export function ContextMenuProvider({ children }: ContextMenuProviderProps) {
  // Initialize and provide the context menu state
  const menuState = useContextMenu()
  return <MenuCtx.Provider value={menuState}>{children}</MenuCtx.Provider>
}

export const useMenuContext = (): ContextMenuContextType => {
  const context = useContext(MenuCtx)
  if (!context) {
    throw new Error('useMenuContext must be used within ContextMenuProvider')
  }
  return context
}
