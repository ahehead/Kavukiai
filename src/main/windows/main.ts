import { BrowserWindow } from "electron";
import { join } from "node:path";
import { createWindow } from "lib/electron-app/factories/windows/create";
import { ENVIRONMENT } from "shared/constants";
import { displayName } from "~/package.json";
import {
  type ApplicationSettings,
  createDefaultApplicationSettings,
} from "main/types";
import { Conf } from "electron-conf";
import { createAppMenu } from "main/menu/menu";

// windowの位置とサイズを保存するためのconf
const conf = new Conf<ApplicationSettings>({
  name: "app-settings",
});

const windowSettings = {
  ...createDefaultApplicationSettings().windowSettings,
  ...conf.get("windowSettings"),
};

export async function MainWindow() {
  const window = createWindow({
    id: "main",
    title: displayName,
    width: windowSettings.width,
    height: windowSettings.height,
    x: windowSettings.x,
    y: windowSettings.y,
    show: false,
    center: false,
    movable: true,
    resizable: true,
    alwaysOnTop: windowSettings.alwaysOnTop,
    autoHideMenuBar: false,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "rgba(0,0,0,0)", // 背景色（RGB / RGBA / HSLA も可）
      symbolColor: "#111111", // ボタンアイコンの色（Windows 限定）
      height: 32, // ピクセル指定も可（省略可）
    },

    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
    },
  });

  // メニュー作成
  createAppMenu(window);

  window.webContents.on("did-finish-load", () => {
    if (ENVIRONMENT.IS_DEV) {
      window.webContents.openDevTools({ mode: "detach" });
    }

    window.show();
  });

  window.on("close", () => {
    // ウィンドウの位置とサイズを保存
    const bounds = window.getBounds();
    const alwaysOnTop = window.isAlwaysOnTop();
    conf.set("windowSettings", {
      ...windowSettings,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      alwaysOnTop,
    });

    for (const window of BrowserWindow.getAllWindows()) {
      window.destroy();
    }
  });

  return window;
}
