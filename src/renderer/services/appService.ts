import type { MainState, PersistedMainState } from "shared/AppType";
import type { CloseFileDialogResponse } from "shared/ApiType";
import type { GraphJsonData } from "shared/JsonType";

const { App } = window;

export const electronApiService = {
  showCloseConfirm: (): Promise<{ response: CloseFileDialogResponse }> =>
    App.showCloseConfirm(),

  showSaveDialog: (title: string): Promise<string | null> =>
    App.showSaveDialog(title),

  saveGraphJsonData: (
    filePath: string,
    graph: GraphJsonData,
    lastHash: string
  ): Promise<string | null> => App.saveGraphJsonData(filePath, graph, lastHash),

  loadAppStateSnapshot: (): Promise<MainState> => App.loadAppStateSnapshot(),

  takeAppStateSnapshot: (state: PersistedMainState): void =>
    App.takeAppStateSnapshot(state),

  onOpenSettings: (handler: () => void): (() => void) =>
    App.onOpenSettings(handler),

  onSaveGraphInitiate: (handler: () => Promise<boolean>): (() => void) =>
    App.onSaveGraphInitiate(handler),

  onFileLoadedRequest: (
    handler: (
      e: Electron.IpcRendererEvent,
      path: string,
      name: string,
      json: GraphJsonData
    ) => Promise<void>
  ): (() => void) => App.onFileLoadedRequest(handler),
};
