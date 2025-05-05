/* ===========================================================
 * 状態管理 – AppState / PersistedAppState / ApiKeysState / PersistedApiKeysState
 * ===========================================================
 */
import type { GraphJsonData } from "./JsonType";
import basic from "./basic.json";
import {
  initializeHistoryState,
  type HistoryState,
} from "../renderer/nodeEditor/features/editor_state/historyState";
import { hashGraph } from "../renderer/features/dirty-check/hash";

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

/* ---------- タブ管理 ---------- */
export type ActiveFileId = {
  activeFileId: string | null;
};

/* ---------- ファイル ---------- */
export type File = {
  id: string;
  title: string;
  path: string | null;
  graph: GraphJsonData;
  graphHash: string; // 最後に保存したときのグラフのハッシュ値
  readonly createdAt: number;
  readonly updatedAt: number;
  historyState: HistoryState;
};

/* historyState を除外した永続化用ファイル */
export type PersistedFile = Omit<File, "historyState">;

/* ---------- MainState（API キーを除く全体） ---------- */
type MainStateBase<F> = {
  version: string;
  files: F; // File[] または PersistedFile[]
  settings: {
    ui: UISettings;
  };
} & ActiveFileId;

/* ---------- 実行時 / 保存時 ---------- */
export type MainState = MainStateBase<File[]>;
export type PersistedMainState = MainStateBase<PersistedFile[]>;

/* ---------- ApiKeysState（認証情報だけ） ---------- */
export type ApiKeysFlags = Flags<Provider>; // 実行時: { openai: true/false, … }
export type ApiKeysSecrets = Secrets<Provider>; // 保存用: { openai: Buffer|null, … }

export type ApiKeysState = { version: string; keys: ApiKeysFlags };
export type PersistedApiKeysState = { version: string; keys: ApiKeysSecrets };
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

export const createApiKeysFlags = (): ApiKeysFlags =>
  Object.fromEntries(providers.map((p) => [p, false])) as ApiKeysFlags;

export const createApiKeysSecrets = (): ApiKeysSecrets =>
  Object.fromEntries(providers.map((p) => [p, null])) as ApiKeysSecrets;

export async function createFile(
  title: string,
  graph: GraphJsonData = basic,
  path: string | null = null
): Promise<File> {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title,
    graph: graph,
    path: path,
    graphHash: await hashGraph(graph),
    createdAt: now,
    updatedAt: now,
    historyState: initializeHistoryState(),
  };
}

/* ---------- AppState（実行時） ---------- */
export function createMainState(): MainState {
  return {
    version: "1",
    files: [],
    settings: {
      ui: createUISettings(),
    },
    ...createActiveFileId(),
  };
}

/* ---------- PersistedAppState（保存用） ---------- */
export function createPersistedMainState(): PersistedMainState {
  return {
    version: "1",
    files: [],
    settings: {
      ui: createUISettings(),
    },
    ...createActiveFileId(),
  };
}

export const createApiKeysState = (): ApiKeysState => ({
  version: "1",
  keys: createApiKeysFlags(),
});

export const createPersistedApiKeysState = (): PersistedApiKeysState => ({
  version: "1",
  keys: createApiKeysSecrets(),
});

/* ===========================================================
 * 変換ユーティリティ
 * ===========================================================
 */
/* ------- ApiKeysSecrets ⇄ ApiKeysFlags ------- */
export const secretsToFlags = (src: ApiKeysSecrets): ApiKeysFlags =>
  Object.fromEntries(providers.map((p) => [p, !!src[p]])) as ApiKeysFlags;

export const flagsToSecrets = (
  flags: ApiKeysFlags,
  prevSecrets: ApiKeysSecrets
): ApiKeysSecrets =>
  Object.fromEntries(
    providers.map((p) => [p, flags[p] ? prevSecrets[p] : null])
  ) as ApiKeysSecrets;

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

export function convertPersistedMainToMain(src: PersistedMainState): MainState {
  return {
    ...src,
    files: convertPersistedFilesToFiles(src.files),
  };
}

export function convertMainToPersistedMain(src: MainState): PersistedMainState {
  return {
    ...src,
    files: convertFilesToPersistedFiles(src.files),
  };
}
