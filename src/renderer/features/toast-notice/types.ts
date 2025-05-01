export type NoticeKind = "info" | "success" | "warning" | "error";

export interface Notice {
  id: string; // uuid v4 など
  kind: NoticeKind;
  message: string;
  meta?: unknown; // 失敗 API のレスポンスなど任意
  createdAt: number; // Date.now()
  read: boolean; // ベルで開いたら true
}
