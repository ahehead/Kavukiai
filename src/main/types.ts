export type ApplicationSettings = {
  windowSettings: WindowSettings;
  systemSettings: SystemSettings;
};

export type WindowSettings = {
  width: number;
  height: number;
  x: number;
  y: number;
  isMaximized: boolean;
  isFullscreen: boolean;
};

export type SystemSettings = {
  // 前回の保存フォルダ
  lastSaveDir: string | null;
};

export function createDefaultApplicationSettings(): ApplicationSettings {
  return {
    windowSettings: {
      width: 1200,
      height: 800,
      x: 0,
      y: 0,
      isMaximized: false,
      isFullscreen: false,
    },
    systemSettings: {
      lastSaveDir: null,
    },
  };
}
