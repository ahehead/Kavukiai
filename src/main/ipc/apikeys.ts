import { ipcMain, safeStorage } from "electron";
import {
  type ApiKeysFlags,
  type ApiKeysSecrets,
  providers,
  secretsToFlags,
} from "shared/ApiKeysType";
import { IpcChannel, type IpcResult } from "shared/ApiType";
import { ApiKeysConf } from "main/features/file/conf";

export function registerApiKeysHandlers(): void {
  // サービス鍵保存（暗号化）
  ipcMain.handle(
    IpcChannel.SaveApiKey,
    (
      _evt,
      service: keyof ApiKeysFlags,
      apiKey: string
    ): IpcResult<ApiKeysFlags> => {
      try {
        const apiKeysConf = ApiKeysConf();

        if (!providers.includes(service)) {
          return { status: "error", message: `不正なサービス名:${service}` };
        }

        apiKeysConf.set(`keys.${service}`, safeStorage.encryptString(apiKey));

        const flags = secretsToFlags(apiKeysConf.get("keys") as ApiKeysSecrets);
        return { status: "success", data: flags };
      } catch (err) {
        console.error(`APIキー保存失敗(${service}):`, err);
        return {
          status: "error",
          message: `APIキー保存失敗(${service}): ${err}`,
        };
      }
    }
  );

  // サービス鍵状態取得
  ipcMain.handle(IpcChannel.LoadApiKeys, (): IpcResult<ApiKeysFlags> => {
    try {
      const apiKeysConf = ApiKeysConf();
      const persistedKeys = apiKeysConf.get("keys") as ApiKeysSecrets;
      const flags = secretsToFlags(persistedKeys);
      return { status: "success", data: flags };
    } catch (err) {
      console.error("APIキー状態取得失敗:", err);
      return {
        status: "error",
        message: `APIキー状態取得失敗: ${err}`,
      };
    }
  });
}
