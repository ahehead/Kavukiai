import { ipcMain, safeStorage } from "electron";
import { Conf } from "electron-conf/main";
import {
  type ApiKeysFlags,
  type ApiKeysSecrets,
  createPersistedApiKeysState,
  type PersistedApiKeysState,
  providers,
  secretsToFlags,
} from "shared/ApiKeysType";
import { IpcChannel } from "shared/ApiType";
import type { MainState, PersistedMainState } from "shared/AppType";
import {
  convertPersistedMainToMain,
  createPersistedMainState,
} from "shared/AppType";

// ストレージ初期化
const appSateConf = new Conf<{ appState: PersistedMainState }>({
  defaults: { appState: createPersistedMainState() },
});

const apiKeysConf = new Conf<PersistedApiKeysState>({
  defaults: createPersistedApiKeysState(),
});

/* ===========================================================
 * IPCハンドラ登録
 * ===========================================================
 */
export function registerSnapshotHandlers(): void {
  // 初期状態読み込み
  ipcMain.handle(IpcChannel.LoadSnapshot, (): MainState => {
    const saveState = appSateConf.get("appState");
    const state = convertPersistedMainToMain(saveState);
    return state;
  });

  // サービス鍵保存（暗号化）
  ipcMain.handle(
    IpcChannel.SaveApiKey,
    (
      _evt,
      service: keyof ApiKeysFlags,
      apiKey: string | null
    ): ApiKeysFlags => {
      try {
        if (!providers.includes(service)) {
          throw new Error(`不正なサービス名:${service}`);
        }
        const enc = apiKey ? safeStorage.encryptString(apiKey) : null;
        apiKeysConf.set(`keys.${service}`, enc);
      } catch (err) {
        console.error(`APIキー保存失敗(${service}):`, err);
      }
      return secretsToFlags(apiKeysConf.get("keys") as ApiKeysSecrets);
    }
  );

  // MainState保存
  ipcMain.on(
    IpcChannel.SaveSnapshot,
    (_evt, state: PersistedMainState): void => {
      appSateConf.set("appState", state);
      console.log("AppState Saved");
    }
  );
}
