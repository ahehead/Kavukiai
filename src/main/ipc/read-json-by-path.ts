import { promises as fs } from "node:fs";
import { ipcMain } from "electron";
import { IpcChannel, type IpcResult } from "shared/ApiType";

export const registerReadJsonByPathHandler = () => {
  ipcMain.handle(
    IpcChannel.ReadJsonByPath,
    async (_event, path: string): Promise<IpcResult<unknown>> => {
      try {
        const content = await fs.readFile(path, "utf-8");
        const json = JSON.parse(content) as unknown;
        return { status: "success", data: json };
      } catch (e: any) {
        return {
          status: "error",
          message: e?.message ?? String(e),
          code: e?.code,
        };
      }
    }
  );
};
