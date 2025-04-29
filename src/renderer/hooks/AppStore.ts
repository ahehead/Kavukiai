import {
  createAppState,
  type UISettings,
  type ApiKeys,
  type AppState,
  type File as AppFile,
} from "shared/AppType";
import {
  initializeHistoryState,
  type HistoryState,
} from "renderer/nodeEditor/features/editor_state/historyState";
import { create } from "zustand";

type Store = AppState & {
  setActiveFileId: (id: string | null) => void;
  setUISettings: (settings: Partial<UISettings>) => void;
  setApiKeys: (keys: Partial<ApiKeys>) => void;
  addFile: (file: AppFile) => void;
  removeFile: (id: AppFile["id"]) => void;
  updateFile: (id: AppFile["id"], updates: Partial<AppFile>) => void;
  addHistory: (fileId: string, history: HistoryState) => void;
  clearHistory: (fileId: string) => void;
};

const initial = createAppState();

const useAppStore = create<Store>((set) => ({
  ...initial,

  // タブ切替
  setActiveFileId: (id) => set({ activeFileId: id }),

  // 設定更新
  setUISettings: (ui) =>
    set((s) => ({
      settings: { ...s.settings, ui: { ...s.settings.ui, ...ui } },
    })),
  setApiKeys: (api) =>
    set((s) => ({
      settings: { ...s.settings, api: { ...s.settings.api, ...api } },
    })),

  // ファイル操作
  addFile: (file) => set((s) => ({ files: [...s.files, file] })),
  removeFile: (id) =>
    set((s) => ({
      files: s.files.filter((f) => f.id !== id),
      activeFileId: s.activeFileId === id ? null : s.activeFileId,
    })),
  updateFile: (id, updates) =>
    set((s) => ({
      files: s.files.map((f) =>
        f.id === id ? { ...f, ...updates, updatedAt: Date.now() } : f
      ),
    })),

  // 履歴操作
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
