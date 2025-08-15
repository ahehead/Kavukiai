import { ENVIRONMENT } from "shared/constants";

export type ApplicationSettings = {
  windowSettings: WindowSettings;
  systemSettings: SystemSettings;
};

export type WindowSettings = {
  width: number;
  height: number;
  x: number;
  y: number;
  alwaysOnTop: boolean;
};

export type SystemSettings = {
  // 前回の保存フォルダ
  lastDir: string | null;
};

export function createDefaultApplicationSettings(): ApplicationSettings {
  return {
    windowSettings: {
      width: 700,
      height: 473,
      x: 0,
      y: 0,
      // 開発時は常に最前面 / 本番パッケージでは通常ウィンドウ
      alwaysOnTop: ENVIRONMENT.IS_DEV,
    },
    systemSettings: {
      lastDir: null,
    },
  };
}

export enum ConfFileName {
  ApplicationSettings = "app-settings",
  ApiKeys = "api-keys",
}
