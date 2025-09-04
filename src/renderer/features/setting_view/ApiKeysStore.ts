// src/renderer/stores/apiKeysStore.ts

import {
  type ApiKeysFlags,
  type ApiKeysState,
  createApiKeysState,
} from "shared/ApiKeysType";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

type ApiKeysStore = ApiKeysState & {
  setApiKeysFlags: (keys: Partial<ApiKeysFlags>) => void;
  setApiKeysState: (state: ApiKeysState) => void;
};

const initial = createApiKeysState();

export const useApiKeysStore = create<ApiKeysStore>()(
  subscribeWithSelector((set) => ({
    ...initial,
    setApiKeysState: (state) => set(() => ({ ...state })),
    setApiKeysFlags: (keys) => set((s) => ({ keys: { ...s.keys, ...keys } })),
  }))
);
