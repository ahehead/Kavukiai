import { create } from 'zustand'

type UiState = {
  templatesOpen: boolean
  openTemplates: () => void
  closeTemplates: () => void
  toggleTemplates: () => void
}

export const useUiStore = create<UiState>(set => ({
  templatesOpen: false,
  openTemplates: () => set({ templatesOpen: true }),
  closeTemplates: () => set({ templatesOpen: false }),
  toggleTemplates: () => set(state => ({ templatesOpen: !state.templatesOpen })),
}))

