import { BrowserWindow, Menu } from "electron";
import { join } from "node:path";

import { createWindow } from "lib/electron-app/factories/windows/create";
import { ENVIRONMENT } from "shared/constants";
import { displayName } from "~/package.json";

export async function MainWindow() {
  const window = createWindow({
    id: "main",
    title: displayName,
    width: 700,
    height: 473,
    show: false,
    center: true,
    movable: true,
    resizable: true,
    alwaysOnTop: true,
    autoHideMenuBar: false,

    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
    },
  });

  const menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "Quit",
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            window.close();
          },
        },
      ],
    },
    {
      label: "Settings",

      click: () => {
        window.webContents.send("open-settings");
      },
    },
  ]);

  Menu.setApplicationMenu(menu);

  window.webContents.on("did-finish-load", () => {
    if (ENVIRONMENT.IS_DEV) {
      window.webContents.openDevTools({ mode: "detach" });
    }

    window.show();
  });

  window.on("close", () => {
    for (const window of BrowserWindow.getAllWindows()) {
      window.destroy();
    }
  });

  return window;
}
