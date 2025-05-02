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
  lastSaveDir: string | null;
};

export function createDefaultApplicationSettings(): ApplicationSettings {
  return {
    windowSettings: {
      width: 700,
      height: 473,
      x: 0,
      y: 0,
      alwaysOnTop: true,
    },
    systemSettings: {
      lastSaveDir: null,
    },
  };
}
