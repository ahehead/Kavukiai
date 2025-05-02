import type { MainState, PersistedMainState } from "shared/AppType";
import type { CloseFileDialogResponse } from "shared/ApiType";

const { App } = window;

export const appService = {
  showCloseConfirm: (): Promise<{ response: CloseFileDialogResponse }> =>
    App.showCloseConfirm(),

  showSaveDialog: (title: string): Promise<string | null> =>
    App.showSaveDialog(title),

  saveGraphJsonData: (
    filePath: string,
    graph: unknown
  ): Promise<string | null> => App.saveGraphJsonData(filePath, graph),

  loadAppStateSnapshot: (): Promise<MainState> => App.loadAppStateSnapshot(),

  takeAppStateSnapshot: (state: PersistedMainState): void =>
    App.takeAppStateSnapshot(state),

  onOpenSettings: (handler: () => void): (() => void) =>
    App.onOpenSettings(handler),

  onSaveGraphInitiate: (handler: () => Promise<boolean>): (() => void) =>
    App.onSaveGraphInitiate(handler),
};
