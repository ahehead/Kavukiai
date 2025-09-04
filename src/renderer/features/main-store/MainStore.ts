import type { NodeEditorState } from "renderer/nodeEditor/features/editor_state/historyState";
import { initializeHistoryState } from "renderer/nodeEditor/features/editor_state/historyState";
import {
  type File as AppFile,
  createMainState,
  type MainState,
  type UISettings,
} from "shared/AppType";
import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { createDebouncedJSONStorage } from "zustand-debounce";

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
  persist(
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
            f.id === fileId
              ? { ...f, historyState: initializeHistoryState() }
              : f
          ),
        })),

      getGraphAndHistory: (fileId) => {
        const f = get().files.find((f) => f.id === fileId);
        return f ? { graph: f.graph, historyState: f.historyState } : undefined;
      },
    })),
    {
      name: "main-store",
      storage: createDebouncedJSONStorage("localStorage", {
        debounceTime: 1500, // 1.5秒後に保存
      }),
      //永続化する state を絞り込む（historyState を除外）
      partialize: (state) => ({
        version: state.version,
        files: state.files.map(({ historyState, ...f }) => f),
        settings: state.settings,
        activeFileId: state.activeFileId,
      }),

      // リハイドレーション後に historyState を再初期化
      onRehydrateStorage: () => (store) => {
        if (store) {
          store.setMainState({
            version: store.version,
            settings: store.settings,
            activeFileId: store.activeFileId,
            files: store.files.map((f) => ({
              ...f,
              historyState: initializeHistoryState(),
            })),
          });
        }
      },
    }
  )
);

export default useMainStore;
