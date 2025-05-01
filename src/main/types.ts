export type ApplicationSettings = {
  width: number;
  height: number;
  x: number;
  y: number;
  isMaximized: boolean;
  isFullscreen: boolean;

  // 前回の保存フォルダ
  lastSaveDir: string | null;
};

export function createDefaultApplicationSettings(): ApplicationSettings {
  return {
    width: 1200,
    height: 800,
    x: 0,
    y: 0,
    isMaximized: false,
    isFullscreen: false,
    lastSaveDir: null,
  };
}
