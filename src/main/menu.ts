import {
  type BrowserWindow,
  Menu,
  type MenuItemConstructorOptions,
} from "electron";
import { IpcChannel } from "shared/ApiType";

export function createAppMenu(window: BrowserWindow) {
  const template: MenuItemConstructorOptions[] = [
    {
      label: "File",
      submenu: [
        {
          label: "Save",
          accelerator: "CmdOrCtrl+S",
          click: () => window.webContents.send(IpcChannel.SaveGraphInitiate),
        },
        { type: "separator" },
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
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
