import { ipcMain } from "electron";
import { LMStudioClient, type ModelInfo } from "@lmstudio/sdk";
import { IpcChannel, type IpcResult } from "shared/ApiType";

export function registerLMStudioHandlers(): void {
  ipcMain.handle(
    IpcChannel.ListLMStudioModels,
    async (): Promise<IpcResult<Array<ModelInfo>>> => {
      try {
        const client = new LMStudioClient();
        const models = await client.system.listDownloadedModels();
        return { status: "success", data: models };
      } catch (err: any) {
        console.error("ListLMStudioModels error:", err);
        return { status: "error", message: String(err?.message ?? err) };
      }
    }
  );
}
