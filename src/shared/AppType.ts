import type { GraphJsonData } from "./JsonType";

// 全体状態
export type AppState = {
  version: string; // ステートバージョン（マイグレーション対応用）
  files: File[];
  settings: Settings;
} & ActiveFile;

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

// API キー（レンダー側に渡すのは登録有無だけ）
export type ApiKeys = {
  openai: boolean;
  google: boolean;
};

// 保存用（暗号化後のバイナリ）
export type ApiKeysSave = {
  openai: Buffer | null;
  google: Buffer | null;
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

export function createAppState(): AppState {
  return {
    version: "1.0.0",
    files: [],
    settings: createSettings(),
    ...createActiveFile(),
  };
}

export function createSettings(): Settings {
  return {
    ui: createUISettings(),
    api: createApiKeys(),
  };
}

// 初期化用ファクトリ関数
export function createUISettings(): UISettings {
  return {
    snap: false,
    theme: "light",
  };
}

// 初期化用ファクトリ関数
export function createApiKeys(): ApiKeys {
  return {
    openai: false,
    google: false,
  };
}

export function createActiveFile(): ActiveFile {
  return {
    activeFileId: null,
  };
}

export function createFile(id: string, title: string): File {
  return {
    id,
    title,
    graph: {} as GraphJsonData, // 別処理で設定
    path: undefined,
    isDirty: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
