import { ipcMain } from "electron";
import { IpcChannel, type IpcResult } from "shared/ApiType";
import { getComfyApiClient, listWorkflows } from "./comfyApiClient";
import { ComfyTemplatesClient } from "./comfyTemplatesClient";

export function registerComfyUIWorkflowListHandlers(): void {
  ipcMain.handle(
    IpcChannel.ListComfyUserWorkflows,
    async (_e, endpoint: string): Promise<IpcResult<string[]>> => {
      try {
        const api = getComfyApiClient(endpoint);
        const entries = await listWorkflows(api);
        const names = entries.map((e) => e.name).filter(Boolean);
        return { status: "success", data: names };
      } catch (err: any) {
        console.error("Error listing comfy user workflows:", err);
        return { status: "error", message: String(err?.message ?? err) };
      }
    }
  );

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
}
