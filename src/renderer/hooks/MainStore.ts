import {
  createMainState,
  type UISettings,
  type MainState,
  type File as AppFile,
} from "shared/AppType";
import { initializeHistoryState } from "renderer/nodeEditor/features/editor_state/historyState";
import { create } from "zustand";
import type { NodeEditorState } from "renderer/nodeEditor/features/editor_state/historyState";
import { subscribeWithSelector } from "zustand/middleware";

export type MainStore = MainState & {
  /* ───────────── actions ───────────── */
  setMainState: (s: MainState) => void;

  // ファイル取得
  getFileById: (id: string) => AppFile | undefined;

  // タブ操作
  setActiveFileId: (id: string | null) => void;

  // UI 設定
  setUISettings: (settings: Partial<UISettings>) => void;

  // ファイル CRUD
  addFile: (file: AppFile) => void;
  removeFile: (id: AppFile["id"]) => void;
  updateFile: (id: AppFile["id"], updates: Partial<AppFile>) => void;

  // グラフ＋履歴
  setGraphAndHistory: (id: string, state: NodeEditorState) => void;
  clearHistory: (id: string) => void;
  getGraphAndHistory: (id: string) => NodeEditorState | undefined;
};

const initial = createMainState();

const useMainStore = create<MainStore>()(
  subscribeWithSelector((set, get) => ({
    ...initial,

    /* ---------- bulk import/export ---------- */
    setMainState: (state) => set(() => ({ ...state })),

    getFileById: (id: string) => {
      return get().files.find((f) => f.id === id);
    },

    /* ---------- タブ ---------- */
    setActiveFileId: (id) => set({ activeFileId: id }),

    /* ---------- UI 設定 ---------- */
    setUISettings: (ui) =>
      set((s) => ({
        settings: { ui: { ...s.settings.ui, ...ui } },
      })),

    /* ---------- ファイル ---------- */
    addFile: (file) =>
      set((s) => ({ files: [...s.files, file], activeFileId: file.id })),

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

    /* ---------- 履歴 ---------- */
    setGraphAndHistory: (fileId, st) =>
      set((s) => ({
        files: s.files.map((f) =>
          f.id === fileId
            ? { ...f, graph: st.graph, historyState: st.historyState }
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
  }))
);

export default useMainStore;
