const { App } = window;

// 対象メソッド名を列挙
type ApiKeys =
  | "showCloseConfirm"
  | "showSaveDialog"
  | "saveGraphJsonData"
  | "loadAppStateSnapshot"
  | "takeAppStateSnapshot"
  | "onOpenSettings"
  | "onSaveGraphInitiate"
  | "onFileLoadedRequest"
  | "loadFile"
  | "saveApiKey"
  | "loadApiKeys";

type ElectronService = Pick<typeof App, ApiKeys>;

export const electronApiService = App satisfies ElectronService;
