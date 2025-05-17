import { ipcRenderer } from "electron";
import { IpcChannel } from "shared/ApiType";
import type { MainState, PersistedMainState } from "shared/AppType";

export const appStateApi = {
  // アプリの状態を復元
  loadAppStateSnapshot: (): Promise<MainState> =>
    ipcRenderer.invoke(IpcChannel.LoadSnapshot),
  // アプリの状態をスナップショットする
  takeAppStateSnapshot: (state: PersistedMainState): void =>
    ipcRenderer.send(IpcChannel.SaveSnapshot, state),
};
