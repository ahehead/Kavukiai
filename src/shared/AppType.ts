import type { GraphJsonData } from "./JsonType";

// 全体状態
export type AppState = {
  version: string; // ステートバージョン（マイグレーション対応用）
  files: File[];
  active: ActiveFile;
  settings: Settings;
};

// 将来的に Settings を分割・拡張しやすいようにまとめ直し
export type Settings = {
  ui: UISettings;
  api: ApiKeys;
};

// UI 設定
export type UISettings = {
  snap: boolean;
  theme: "light" | "dark";
};

// API キー
export type ApiKeys = {
  openai: Buffer | null;
};

// タブ管理用
export type ActiveFile = {
  activeFileId: string | null;
};

// ファイル情報
export type File = {
  id: string; // ユニークID（タブ管理や履歴と紐付けやすく）
  title: string;
  path?: string; // 保存先パス
  graph: GraphJsonData;
  isDirty: boolean; // 未保存フラグ
  createdAt: number; // 作成日時（タイムスタンプ）
  updatedAt: number; // 最終更新日時
};
