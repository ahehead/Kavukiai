import { safeStorage } from "electron";
import { Conf } from "electron-conf";
import {
  type ApplicationSettings,
  ConfFileName,
  createDefaultApplicationSettings,
} from "main/types";
import {
  type ApiKeysFlags,
  type ApiKeysSecrets,
  createPersistedApiKeysState,
  secretsToFlags,
  type PersistedApiKeysState,
} from "shared/ApiKeysType";

export function ApplicationSettingsConf(): Conf<ApplicationSettings> {
  return new Conf<ApplicationSettings>({
    name: ConfFileName.ApplicationSettings,
    defaults: createDefaultApplicationSettings(),
  });
}

export function ApiKeyConf(): Conf<PersistedApiKeysState> {
  return new Conf<PersistedApiKeysState>({
    name: ConfFileName.ApiKeys,
    defaults: createPersistedApiKeysState(),
  });
}

export function saveApiKeyConf(
  apiKeysConf: ReturnType<typeof ApiKeyConf>,
  service: keyof ApiKeysFlags,
  apiKey: string
): void {
  apiKeysConf.delete(`keys.${service}`);
  const buffer = safeStorage.encryptString(apiKey);
  apiKeysConf.set(`keys.${service}`, buffer.toString("latin1"));
}

export function getApiKeyFlagsConf(
  apiKeysConf: ReturnType<typeof ApiKeyConf>
): ApiKeysFlags {
  return secretsToFlags(apiKeysConf.get("keys") as ApiKeysSecrets);
}

export function getApiKeyConf(
  apiKeysConf: ReturnType<typeof ApiKeyConf>,
  service: keyof ApiKeysFlags
): string {
  const encrypted = apiKeysConf.get(`keys.${service}`) as string | null;
  const apiKey = encrypted
    ? safeStorage.decryptString(Buffer.from(encrypted, "latin1"))
    : null;
  if (!apiKey) throw new Error("APIキー未設定");
  return apiKey;
}
