import { ipcMain } from "electron";
import { IpcChannel, type IpcResult } from "shared/ApiType";
import { getComfyApiClient } from "./comfyApiClient";

type FreeMemoryArgs = {
  endpoint?: string;
  unloadModels?: boolean;
  freeMemory?: boolean;
};

export function registerComfyUIFreeMemoryHandler(): void {
  ipcMain.handle(
    IpcChannel.ComfyUIFreeMemory,
    async (_e, args: FreeMemoryArgs = {}): Promise<IpcResult<boolean>> => {
      try {
        const endpoint = args.endpoint ?? "http://127.0.0.1:8000";
        const unloadModels = Boolean(args.unloadModels);
        const freeMemory = args.freeMemory ?? true;

        const api = getComfyApiClient(endpoint);
        try {
          await api.pollStatus();
        } catch {
          throw new Error("ComfyUIに接続できませんでした。");
        }
        const ok = await api.freeMemory(unloadModels, freeMemory);
        if (!ok) return { status: "error", message: "Free memory failed" };
        return { status: "success", data: true };
      } catch (err: any) {
        console.error("[ComfyUI][freeMemory] error:", err);
        return { status: "error", message: String(err?.message ?? err) };
      }
    }
  );
}
