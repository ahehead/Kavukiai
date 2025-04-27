import { app, ipcMain, safeStorage } from "electron";
import { Conf } from "electron-conf/main";
import type { AppState, ActiveFile, ApiKeysSave } from "shared/AppType";
import { createAppState } from "shared/AppType";

// ストレージ初期化
const fileListConf = new Conf<{ files: AppState["files"] }>({
  defaults: { files: [] },
});
const activeFileConf = new Conf<ActiveFile>({
  defaults: { activeFileId: null },
});
const apiKeysConf = new Conf<{ api: ApiKeysSave }>({
  defaults: { api: { openai: null, google: null } },
});

export function registerStateHandlers(): void {
  // 初期状態読み込み
  ipcMain.handle("load-state", (): AppState => {
    const state = createAppState();
    state.version = app.getVersion();
    state.files = fileListConf.get("files");
    state.activeFileId = activeFileConf.get("activeFileId");
    const saved = apiKeysConf.get("api");
    state.settings.api.openai = Boolean(saved.openai);
    state.settings.api.google = Boolean(saved.google);
    return state;
  });

  // サービス鍵保存（暗号化） service: "openai" | "google"
  ipcMain.handle(
    "save-service-key",
    (_evt, service: keyof ApiKeysSave, apiKey: string | null) => {
      try {
        const enc = apiKey ? safeStorage.encryptString(apiKey) : null;
        if (service !== "openai" && service !== "google") {
          throw new Error("不正なサービス名");
        }
        apiKeysConf.set(service, enc);
      } catch (err) {
        console.error(`APIキー保存失敗(${service}):`, err);
      }
    }
  );
}
