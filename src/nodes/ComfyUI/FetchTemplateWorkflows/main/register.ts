import { ipcMain } from "electron";
import { IpcChannel, type IpcResult } from "shared/ApiType";
import { ComfyTemplatesClient } from "../../common/main/comfyTemplatesClient";

export const register = (): void => {
  ipcMain.handle(
    IpcChannel.ListComfyTemplateWorkflows,
    async (_e, endpoint: string): Promise<IpcResult<string[]>> => {
      try {
        const client = new ComfyTemplatesClient(endpoint);
        const templates = await client.listTemplates();
        const names = templates.map((t) => t.name).filter(Boolean);
        return { status: "success", data: names };
      } catch (err: any) {
        console.error("Error listing comfy template workflows:", err);
        return { status: "error", message: String(err?.message ?? err) };
      }
    }
  );
};
