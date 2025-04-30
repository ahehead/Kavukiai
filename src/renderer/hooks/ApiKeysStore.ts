// src/renderer/stores/apiKeysStore.ts
import {
  createApiKeysState,
  type ApiKeysState,
  type ApiKeysFlags,
} from "shared/AppType";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

type ApiKeysStore = ApiKeysState & {
  /* ───────────── actions ───────────── */
  setApiKeysFlags: (keys: Partial<ApiKeysFlags>) => void;
  setApiKeysState: (state: ApiKeysState) => void;
};

const initial = createApiKeysState();

export const useApiKeysStore = create<ApiKeysStore>()(
  subscribeWithSelector((set) => ({
    ...initial,

    /* ---------- bulk import/export ---------- */
    setApiKeysState: (state) => set(() => ({ ...state })),

    /* ---------- 個別更新 ---------- */
    setApiKeysFlags: (keys) => set((s) => ({ keys: { ...s.keys, ...keys } })),
  }))
);
