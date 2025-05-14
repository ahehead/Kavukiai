/*** Provider 定義 ***/
export const providers = ["openai", "google", "gemini", "ollama"] as const;
export type Provider = (typeof providers)[number];

/*** ユーティリティ型 ***/
type Flags<T extends string> = { [P in T]: boolean };
type Secrets<T extends string> = { [P in T]: Buffer | null };

/*** State 型 ***/
export type ApiKeysFlags = Flags<Provider>;
export type ApiKeysSecrets = Secrets<Provider>;
export type ApiKeysState = { version: string; keys: ApiKeysFlags };
export type PersistedApiKeysState = { version: string; keys: ApiKeysSecrets };

/*** ファクトリ関数 ***/
export const createApiKeysFlags = (): ApiKeysFlags =>
  Object.fromEntries(providers.map((p) => [p, false])) as ApiKeysFlags;

export const createApiKeysSecrets = (): ApiKeysSecrets =>
  Object.fromEntries(providers.map((p) => [p, null])) as ApiKeysSecrets;

export const createApiKeysState = (): ApiKeysState => ({
  version: "1",
  keys: createApiKeysFlags(),
});

export const createPersistedApiKeysState = (): PersistedApiKeysState => ({
  version: "1",
  keys: createApiKeysSecrets(),
});

/*** 変換ユーティリティ ***/
export const secretsToFlags = (src: ApiKeysSecrets): ApiKeysFlags =>
  Object.fromEntries(providers.map((p) => [p, !!src[p]])) as ApiKeysFlags;

export const flagsToSecrets = (
  flags: ApiKeysFlags,
  prevSecrets: ApiKeysSecrets
): ApiKeysSecrets =>
  Object.fromEntries(
    providers.map((p) => [p, flags[p] ? prevSecrets[p] : null])
  ) as ApiKeysSecrets;
