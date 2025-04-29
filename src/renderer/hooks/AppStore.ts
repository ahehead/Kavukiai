import {
  initializeHistoryState,
  type HistoryState,
} from "renderer/nodeEditor/features/editor_state/historyState";
import type { AppState, File as AppFile } from "shared/AppType";

import { create } from "zustand";

type Store = AppState & {
  setActiveFileId: (id: string | null) => void;
  addFile: (file: AppFile) => void;
  removeFile: (id: AppFile["id"]) => void;
  updateFile: (id: AppFile["id"], updates: Partial<AppFile>) => void;
  addHistory: (fileId: string, history: HistoryState) => void;
  clearHistory: (fileId: string) => void;
};

const initial = {
  version: "1.0.0",
  files: [] as AppFile[],
  settings: {
    ui: { snap: true, theme: "light" },
    api: { openai: false, google: false },
  },
  activeFileId: null,
} as const;

const useAppStore = create<Store>((set) => ({
  ...initial,
  setActiveFileId: (id) => set({ activeFileId: id }),
  addFile: (file) => set((s) => ({ files: [...s.files, file] })),
  removeFile: (id) =>
    set((s) => ({ files: s.files.filter((f) => f.id !== id) })),
  updateFile: (id, updates) =>
    set((s) => ({
      files: s.files.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),
  addHistory: (fileId, history) =>
    set((s) => ({
      files: s.files.map((f) =>
        f.id === fileId ? { ...f, historyState: history } : f
      ),
    })),
  clearHistory: (fileId) =>
    set((s) => ({
      files: s.files.map((f) =>
        f.id === fileId ? { ...f, historyState: initializeHistoryState() } : f
      ),
    })),
}));

export default useAppStore;
