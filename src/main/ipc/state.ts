import { ipcMain, safeStorage } from "electron";
import { Conf } from "electron-conf/main";
import { IpcChannel } from "shared/ApiType";
import type {
  AppState,
  ApiKeysSave,
  ApiKeys,
  PersistedAppState,
} from "shared/AppType";
import {
  convertApiKeysSaveToApiKeys,
  convertAppStateToPersistedAppState,
  convertPersistedAppStateToAppState,
  createPersistedAppState,
  providers,
} from "shared/AppType";

// ストレージ初期化
const appSateConf = new Conf<{ appState: PersistedAppState }>({
  defaults: { appState: createPersistedAppState() },
});

/* ===========================================================
 * IPCハンドラ登録
 * ===========================================================
 */
export function registerStateHandlers(): void {
  // 初期状態読み込み
  ipcMain.handle(IpcChannel.LoadState, (): AppState => {
    const saveState = appSateConf.get("appState");
    const state = convertPersistedAppStateToAppState(saveState);
    return state;
  });

  // サービス鍵保存（暗号化）
  ipcMain.handle(
    IpcChannel.SaveApiKey,
    (_evt, service: keyof ApiKeysSave, apiKey: string | null): ApiKeys => {
      try {
        if (!providers.includes(service)) {
          throw new Error(`不正なサービス名:${service}`);
        }
        const enc = apiKey ? safeStorage.encryptString(apiKey) : null;
        appSateConf.set(`settings.api.${service}`, enc);
      } catch (err) {
        console.error(`APIキー保存失敗(${service}):`, err);
      }
      const saved = appSateConf.get("settings.api") as ApiKeysSave;
      return convertApiKeysSaveToApiKeys(saved);
    }
  );

  // AppState保存（PersistedAppStateに変換して保存）
  ipcMain.on(IpcChannel.SaveState, (_evt, state: AppState): void => {
    const saved = appSateConf.get("settings.api") as ApiKeysSave;
    const persisted = convertAppStateToPersistedAppState(state, saved);
    appSateConf.set("appState", persisted);
  });
}
