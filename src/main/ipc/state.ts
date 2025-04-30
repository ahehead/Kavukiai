import { ipcMain, safeStorage } from "electron";
import { Conf } from "electron-conf/main";
import type {
  AppState,
  ApiKeysSave,
  PersistedFile,
  PersistedAppState,
} from "shared/AppType";
import {
  convertApiKeysSaveToApiKeys,
  convertPersistedFilesToFiles,
  createAppState,
  createPersistedAppState,
  providers,
} from "shared/AppType";

// ストレージ初期化
const appSateConf = new Conf<PersistedAppState>({
  defaults: createPersistedAppState(),
});

export function registerStateHandlers(): void {
  // 初期状態読み込み
  ipcMain.handle("load-state", (): AppState => {
    const state = createAppState();
    state.version = appSateConf.get("version");
    state.files = convertPersistedFilesToFiles(
      appSateConf.get("files") as PersistedFile[]
    );
    state.activeFileId = appSateConf.get("activeFileId");
    state.settings.ui = appSateConf.get("settings.ui");
    state.settings.api = convertApiKeysSaveToApiKeys(
      appSateConf.get("settings.api") as ApiKeysSave
    );
    return state;
  });

  // サービス鍵保存（暗号化） service: "openai" | "google"
  ipcMain.handle(
    "save-service-key",
    (_evt, service: keyof ApiKeysSave, apiKey: string | null) => {
      try {
        if (providers.find((p) => p === service) === undefined) {
          throw new Error(`不正なサービス名:${service}`);
        }
        const enc = apiKey ? safeStorage.encryptString(apiKey) : null;
        appSateConf.set(service, enc);
      } catch (err) {
        console.error(`APIキー保存失敗(${service}):`, err);
      }
    }
  );
}
