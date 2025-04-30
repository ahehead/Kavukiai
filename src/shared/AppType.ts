/* ===========================================================
 * 状態管理 – AppState / PersistedAppState
 * ===========================================================
 */
import type { GraphJsonData } from "./JsonType";
import basic from "./basic.json";
import {
  initializeHistoryState,
  type HistoryState,
} from "../renderer/nodeEditor/features/editor_state/historyState";

/* ---------- UI 設定 ---------- */
export type UISettings = {
  snap: boolean;
  theme: "light" | "dark" | "system";
};

/* ---------- Provider 拡張 ---------- */
export const providers = ["openai", "google", "gemini", "ollama"] as const;
export type Provider = (typeof providers)[number];

type Flags<T extends string> = { [P in T]: boolean };
type Secrets<T extends string> = { [P in T]: Buffer | null };

/* ---------- API キー ---------- */
export type ApiKeys = Flags<Provider>; // 例) { openai: true, gemini: false, ... }
export type ApiKeysSave = Secrets<Provider>; // 例) { openai: <Buffer>, gemini: null, ... }

/* ---------- タブ管理 ---------- */
export type ActiveFileId = {
  activeFileId: string | null;
};

/* ---------- ファイル ---------- */
export type File = {
  id: string;
  title: string;
  path?: string;
  graph: GraphJsonData;
  isDirty: boolean;
  readonly createdAt: number;
  readonly updatedAt: number;
  historyState: HistoryState;
};

/* historyState を除外した永続化用ファイル */
export type PersistedFile = Omit<File, "historyState">;

/* ---------- AppState 共通骨格 ---------- */
type AppStateBase<F, A> = {
  version: string;
  files: F; // File[] または PersistedFile[]
  settings: {
    ui: UISettings;
    api: A; // ApiKeys または ApiKeysSave
  };
} & ActiveFileId;

/* ---------- 実行時 / 保存時 ---------- */
export type AppState = AppStateBase<File[], ApiKeys>;
export type PersistedAppState = AppStateBase<PersistedFile[], ApiKeysSave>;

/* ===========================================================
 * ファクトリ関数
 * ===========================================================
 */
export function createUISettings(): UISettings {
  return { snap: false, theme: "light" };
}

export function createActiveFileId(): ActiveFileId {
  return { activeFileId: null };
}

export function createApiKeys(): ApiKeys {
  // すべて false で初期化
  // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
  return providers.reduce((acc, p) => ({ ...acc, [p]: false }), {} as ApiKeys);
}

export function createApiKeysSave(): ApiKeysSave {
  // すべて null で初期化
  return providers.reduce(
    // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
    (acc, p) => ({ ...acc, [p]: null }),
    {} as ApiKeysSave
  );
}

export function createFile(id: string, title: string): File {
  const now = Date.now();
  return {
    id,
    title,
    graph: basic as GraphJsonData,
    path: undefined,
    isDirty: true,
    createdAt: now,
    updatedAt: now,
    historyState: initializeHistoryState(),
  };
}

/* ---------- AppState（実行時） ---------- */
export function createAppState(): AppState {
  return {
    version: "1",
    files: [],
    settings: {
      ui: createUISettings(),
      api: createApiKeys(),
    },
    ...createActiveFileId(),
  };
}

/* ---------- PersistedAppState（保存用） ---------- */
export function createPersistedAppState(): PersistedAppState {
  return {
    version: "1",
    files: [],
    settings: {
      ui: createUISettings(),
      api: createApiKeysSave(),
    },
    ...createActiveFileId(),
  };
}

/* ===========================================================
 * 変換ユーティリティ
 * ===========================================================
 */
export function convertApiKeysSaveToApiKeys(src: ApiKeysSave): ApiKeys {
  const dst: Partial<ApiKeys> = {};
  for (const p of providers) dst[p] = !!src[p];
  return dst as ApiKeys;
}

export function convertPersistedFileToFile(file: PersistedFile): File {
  return { ...file, historyState: initializeHistoryState() };
}

export function convertPersistedFilesToFiles(files: PersistedFile[]): File[] {
  return files.map(convertPersistedFileToFile);
}

export function convertFileToPersistedFile(file: File): PersistedFile {
  const { historyState, ...rest } = file;
  return rest;
}
export function convertFilesToPersistedFiles(files: File[]): PersistedFile[] {
  return files.map(convertFileToPersistedFile);
}

export function convertPersistedAppStateToAppState(
  src: PersistedAppState
): AppState {
  return {
    version: src.version,
    files: convertPersistedFilesToFiles(src.files),
    settings: {
      ui: src.settings.ui,
      api: convertApiKeysSaveToApiKeys(src.settings.api),
    },
    activeFileId: src.activeFileId,
  };
}

export function convertAppStateToPersistedAppState(
  src: AppState,
  apiKeysSave: ApiKeysSave
): PersistedAppState {
  return {
    version: src.version,
    files: convertFilesToPersistedFiles(src.files),
    settings: {
      ui: src.settings.ui,
      api: apiKeysSave,
    },
    activeFileId: src.activeFileId,
  };
}
