import { ipcMain } from "electron";
import { IpcChannel, type IpcResult } from "shared/ApiType";
import { getComfyApiClient } from "../../common/main/comfyApiClient";

export const register = (): void => {
  ipcMain.handle(
    IpcChannel.ListComfyUserWorkflows,
    async (_e, endpoint: string): Promise<IpcResult<string[]>> => {
      try {
        const api = getComfyApiClient(endpoint);
        const list = await api.listUserData("workflows");
        return { status: "success", data: list };
      } catch (err: any) {
        console.error("Error listing comfy user workflows:", err);
        return { status: "error", message: String(err?.message ?? err) };
      }
    }
  );
};
