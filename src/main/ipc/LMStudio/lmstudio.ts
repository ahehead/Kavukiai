import { ipcMain } from "electron";
import { IpcChannel, type IpcResult } from "shared/ApiType";
import {
  listModelsViaCli,
  startServerViaCli,
  stopServerViaCli,
} from "./service";
import type { ModelInfo } from "@lmstudio/sdk";

export function registerLMStudioHandlers(): void {
  ipcMain.handle(
    IpcChannel.ListLMStudioModels,
    async (): Promise<IpcResult<Array<ModelInfo>>> => {
      try {
        const models = await listModelsViaCli();
        if (models === null) {
          return {
            status: "error",
            message: "CLI not found or failed to execute.",
          };
        }
        return { status: "success", data: models };
      } catch (err: any) {
        console.error("ListLMStudioModels error:", err);
        return { status: "error", message: String(err?.message ?? err) };
      }
    }
  );

  ipcMain.handle(
    IpcChannel.StartLMStudioServer,
    async (): Promise<IpcResult<string>> => {
      try {
        const msg = await startServerViaCli();
        return { status: "success", data: msg };
      } catch (err: any) {
        console.error("StartLMStudioServer error:", err);
        return { status: "error", message: String(err?.message ?? err) };
      }
    }
  );

  ipcMain.handle(
    IpcChannel.StopLMStudioServer,
    async (): Promise<IpcResult<string>> => {
      try {
        const msg = await stopServerViaCli();
        return { status: "success", data: msg };
      } catch (err: any) {
        console.error("StopLMStudioServer error:", err);
        return { status: "error", message: String(err?.message ?? err) };
      }
    }
  );
}
