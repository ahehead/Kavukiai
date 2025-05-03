import { toast } from "sonner";
import { useNoticeStore } from "./useNoticeStore";
import type { NoticeKind } from "./types";

export function notify(kind: NoticeKind, message: string, meta?: unknown) {
  // ① 即時トースト
  toast[kind](message, {
    position: "bottom-right",
    closeButton: true,
    duration: 3000,
  });
  // ② ストアに追加
  useNoticeStore.getState().push({ kind, message, meta });
}
