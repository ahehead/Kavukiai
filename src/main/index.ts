import { app } from "electron";
import { makeAppWithSingleInstanceLock } from "lib/electron-app/factories/app/instance";
import { makeAppSetup } from "lib/electron-app/factories/app/setup";
import { registerIpcHandlers } from "./ipc";
import { MainWindow } from "./windows/main";

makeAppWithSingleInstanceLock(async () => {
  await app.whenReady();
  await makeAppSetup(MainWindow);
  registerIpcHandlers();
});
