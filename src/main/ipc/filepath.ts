import * as fs from "node:fs/promises";
import * as path from "node:path";
import { app, ipcMain } from "electron";
import { IpcChannel } from "shared/ApiType";

export const registerWriteTempFile = () => {
  ipcMain.handle(
    IpcChannel.WriteTempFile,
    async (_e, { name, data }: { name: string; data: Buffer }) => {
      const full = path.join(app.getPath("temp"), `${Date.now()}-${name}`);
      await fs.writeFile(full, data);
      return full;
    }
  );
};
