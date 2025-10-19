import { ipcMain } from "electron";
import { IpcChannel, type IpcResult } from "shared/ApiType";
import { getComfyApiClient } from "../../common/main/comfyApiClient";

export const register = (): void => {
  ipcMain.handle(
    IpcChannel.ListComfyCheckpoints,
    async (_e, endpoint: string): Promise<IpcResult<string[]>> => {
      try {
        const api = getComfyApiClient(endpoint);
        const list = await api.getCheckpoints();
        return { status: "success", data: list };
      } catch (err: any) {
        console.error("Error listing comfy checkpoints:", err);
        return { status: "error", message: String(err?.message ?? err) };
      }
    }
  );
};
