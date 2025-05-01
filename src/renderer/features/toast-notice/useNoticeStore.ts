import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import type { Notice } from "./types";

interface NoticeState {
  list: Notice[];
  push: (n: Omit<Notice, "id" | "createdAt" | "read">) => void;
  markRead: (id: string) => void;
  clear: () => void;
  markAllRead: () => void;
}

export const useNoticeStore = create<NoticeState>()(
  persist(
    subscribeWithSelector((set) => ({
      list: [],
      push: (n) =>
        set((s) => ({
          list: [
            {
              ...n,
              id: crypto.randomUUID(),
              createdAt: Date.now(),
              read: false,
            },
            ...s.list.slice(0, 40), // 40件だけ保持
          ],
        })),
      markRead: (id) =>
        set((s) => ({
          list: s.list.map((l) => (l.id === id ? { ...l, read: true } : l)),
        })),
      clear: () => set({ list: [] }),
      markAllRead: () =>
        set((s) => ({
          list: s.list.map((l) => ({ ...l, read: true })),
        })),
    })),
    { name: "notice-store" } // localStorage 永続化
  )
);
