import { ipcMain } from "electron";
import { IpcChannel, type IpcResult } from "shared/ApiType";

import { stopServerViaCli } from "../../common/main/cliService";

export function registerLMStudioStopHandler(): void {
  ipcMain.handle(
    IpcChannel.StopLMStudioServer,
    async (): Promise<IpcResult<string>> => {
      try {
        const message = await stopServerViaCli();
        return { status: "success", data: message };
      } catch (err: any) {
        console.error("StopLMStudioServer error:", err);
        return { status: "error", message: String(err?.message ?? err) };
      }
    }
  );
}

export const register = registerLMStudioStopHandler;

export default registerLMStudioStopHandler;

