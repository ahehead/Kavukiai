import { ipcMain } from "electron";
import { type ApiKeysFlags, providers } from "shared/ApiKeysType";
import { IpcChannel, type IpcResult } from "shared/ApiType";
import {
  ApiKeyConf,
  getApiKeyFlagsConf,
  saveApiKeyConf,
} from "main/features/file/conf";

export function registerApiKeysHandlers(): void {
  // サービス鍵保存
  ipcMain.handle(
    IpcChannel.SaveApiKey,
    (
      _evt,
      service: keyof ApiKeysFlags,
      apiKey: string
    ): IpcResult<ApiKeysFlags> => {
      if (!providers.includes(service)) {
        return { status: "error", message: `不正なサービス名:${service}` };
      }

      try {
        const apiKeysConf = ApiKeyConf();
        saveApiKeyConf(apiKeysConf, service, apiKey);
        return { status: "success", data: getApiKeyFlagsConf(apiKeysConf) };
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
      const apiKeysConf = ApiKeyConf();
      return { status: "success", data: getApiKeyFlagsConf(apiKeysConf) };
    } catch (err) {
      console.error("APIキー状態取得失敗:", err);
      return {
        status: "error",
        message: `APIキー状態取得失敗: ${err}`,
      };
    }
  });
}
