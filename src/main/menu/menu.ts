import {
  type BrowserWindow,
  Menu,
  type MenuItemConstructorOptions,
} from "electron";
import { openDialogAndReadFile } from "main/features/openFile";
import { IpcChannel } from "shared/ApiType";

export function createAppMenu(window: BrowserWindow) {
  const template: MenuItemConstructorOptions[] = [
    {
      label: "File",
      submenu: [
        {
          label: "Open",
          accelerator: "CmdOrCtrl+O",
          click: async () => {
            window.webContents.send(
              IpcChannel.FileLoadedRequest,
              await openDialogAndReadFile(window)
            );
          },
        },
        {
          label: "Save",
          accelerator: "CmdOrCtrl+S",
          click: () => window.webContents.send(IpcChannel.SaveGraphInitiate),
        },
        {
          label: "Save As",
          accelerator: "CmdOrCtrl+Shift+S",
          click: () => window.webContents.send(IpcChannel.SaveAsGraphInitiate),
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
