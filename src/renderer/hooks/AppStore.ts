import {
  createAppState,
  type UISettings,
  type ApiKeys,
  type AppState,
  type File as AppFile,
} from "shared/AppType";
import { initializeHistoryState } from "renderer/nodeEditor/features/editor_state/historyState";
import { create } from "zustand";
import type { NodeEditorState } from "renderer/nodeEditor/features/editor_state/historyState";

type Store = AppState & {
  setActiveFileId: (id: string | null) => void;
  setUISettings: (settings: Partial<UISettings>) => void;
  setApiKeys: (keys: Partial<ApiKeys>) => void;
  addFile: (file: AppFile) => void;
  removeFile: (id: AppFile["id"]) => void;
  updateFile: (id: AppFile["id"], updates: Partial<AppFile>) => void;
  setGraphAndHistory: (fileId: string, state: NodeEditorState) => void;
  clearHistory: (fileId: string) => void;
  getGraphAndHistory: (fileId: string) => NodeEditorState | undefined;
  setAppState: (state: AppState) => void;
};

const initial = createAppState();

const useAppStore = create<Store>((set, get) => ({
  ...initial,
  setAppState: (state) => set(() => ({ ...state })),

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
  setGraphAndHistory: (fileId, state) =>
    set((s) => ({
      files: s.files.map((f) =>
        f.id === fileId
          ? { ...f, graph: state.graph, historyState: state.historyState }
          : f
      ),
    })),

  clearHistory: (fileId) =>
    set((s) => ({
      files: s.files.map((f) =>
        f.id === fileId ? { ...f, historyState: initializeHistoryState() } : f
      ),
    })),

  getGraphAndHistory: (fileId) => {
    const f = get().files.find((f) => f.id === fileId);
    return f ? { graph: f.graph, historyState: f.historyState } : undefined;
  },
}));

export default useAppStore;
