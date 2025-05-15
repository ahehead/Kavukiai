import { ipcMain } from "electron";
import { Conf } from "electron-conf/main";

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

export function registerSnapshotHandlers(): void {
  // 初期状態読み込み
  ipcMain.handle(IpcChannel.LoadSnapshot, (): MainState => {
    const saveState = appSateConf.get("appState");
    const state = convertPersistedMainToMain(saveState);
    return state;
  });

  // MainState保存
  ipcMain.on(
    IpcChannel.SaveSnapshot,
    (_evt, state: PersistedMainState): void => {
      appSateConf.set("appState", state);
      console.log("AppState Saved");
    }
  );
}
