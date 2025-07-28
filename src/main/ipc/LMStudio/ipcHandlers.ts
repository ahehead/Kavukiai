import type { ModelInfo } from "@lmstudio/sdk";
import { ipcMain } from "electron";
import {
  IpcChannel,
  type IpcResult,
  type LMStudioStatusInfo,
} from "shared/ApiType";
import {
  getStatusViaCli,
  listModelsViaCli,
  startServerViaCli,
  stopServerViaCli,
} from "./cliService";
import { unloadAllModels } from "./modelClient";

export function registerLMStudioHandlers(): void {
  ipcMain.handle(
    IpcChannel.ListLMStudioModels,
    async (): Promise<IpcResult<ModelInfo[]>> => {
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

  ipcMain.handle(
    IpcChannel.GetLMStudioStatus,
    async (): Promise<IpcResult<LMStudioStatusInfo>> => {
      try {
        const info = await getStatusViaCli();
        if (info === null) {
          return {
            status: "error",
            message: "CLI not found or failed to execute.",
          };
        }
        return { status: "success", data: info };
      } catch (err: any) {
        console.error("GetLMStudioStatus error:", err);
        return { status: "error", message: String(err?.message ?? err) };
      }
    }
  );

  ipcMain.handle(
    IpcChannel.UnloadLMStudioModels,
    async (): Promise<IpcResult<string>> => {
      try {
        await unloadAllModels();
        return { status: "success", data: "unloaded" };
      } catch (err: any) {
        console.error("UnloadLMStudioModels error:", err);
        return { status: "error", message: String(err?.message ?? err) };
      }
    }
  );
}
