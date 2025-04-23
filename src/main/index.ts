import { app, ipcMain } from "electron";

import { makeAppWithSingleInstanceLock } from "lib/electron-app/factories/app/instance";
import { makeAppSetup } from "lib/electron-app/factories/app/setup";
import { MainWindow } from "./windows/main";
import { Conf } from "electron-conf/main";

const conf = new Conf({
  name: "appState",
  defaults: {
    hello: "world",
  },
});

makeAppWithSingleInstanceLock(async () => {
  await app.whenReady();
  await makeAppSetup(MainWindow);
  ipcMain.handle("load-state", () => {
    return conf.get("hello");
  });
});
