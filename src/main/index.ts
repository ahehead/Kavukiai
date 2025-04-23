import { app, ipcMain } from "electron";

import { makeAppWithSingleInstanceLock } from "lib/electron-app/factories/app/instance";
import { makeAppSetup } from "lib/electron-app/factories/app/setup";
import { MainWindow } from "./windows/main";
import { Conf } from "electron-conf/main";
import { version } from "~/package.json";
import type { AppState } from "shared/AppType";

type StorageType = {
  state: AppState;
};

const conf = new Conf<StorageType>({
  name: "appState",
  defaults: {
    state: { data: { version: version } },
  },
});

makeAppWithSingleInstanceLock(async () => {
  await app.whenReady();
  await makeAppSetup(MainWindow);
  ipcMain.handle("load-state", () => {
    return conf.get("state") as AppState;
  });
});
