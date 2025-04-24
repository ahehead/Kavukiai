import { app, ipcMain, safeStorage } from "electron";

import { makeAppWithSingleInstanceLock } from "lib/electron-app/factories/app/instance";
import { makeAppSetup } from "lib/electron-app/factories/app/setup";
import { MainWindow } from "./windows/main";
import { Conf } from "electron-conf/main";
import type {
  FileList,
  ActiveFileNumber,
  ApiKeys,
  AppState,
} from "shared/AppType";

const fileListConf = new Conf<FileList>({
  defaults: {
    files: [],
  },
});

const activeFileNumberConf = new Conf<ActiveFileNumber>({
  defaults: {
    activeFileNumber: null,
  },
});
const apiKeysConf = new Conf<ApiKeys>({
  defaults: {
    openai: null,
  },
});

makeAppWithSingleInstanceLock(async () => {
  await app.whenReady();
  await makeAppSetup(MainWindow);

  ipcMain.handle("load-state", () => {
    const fileList = fileListConf.get("files");
    const activeFileNumber = activeFileNumberConf.get("activeFileNumber");
    const openaiBainary = apiKeysConf.get("openai");
    const openai = openaiBainary
      ? safeStorage.decryptString(openaiBainary)
      : null;

    return {
      files: fileList,
      activeFileNumber,
      openai,
    } as AppState;
  });
});
