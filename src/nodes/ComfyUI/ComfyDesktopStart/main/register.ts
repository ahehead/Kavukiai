import http from "node:http";
import { ipcMain } from "electron";
import { IpcChannel } from "shared/ApiType";
import type { LaunchComfyDesktopResult, LaunchOpts } from "shared/ComfyUIType";
import { launchComfyDesktop } from "../../common/main/comfyDesktop";

const checkAlive = (port: number, timeoutMs: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const req = http.get(
      { host: "127.0.0.1", port, path: "/", timeout: timeoutMs },
      (res) => {
        res.resume();
        resolve((res.statusCode ?? 500) < 500);
      }
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
};

export const register = (): void => {
  ipcMain.handle(
    IpcChannel.LaunchComfyDesktop,
    async (_evt, opts: LaunchOpts = {}): Promise<LaunchComfyDesktopResult> => {
      const port = opts.port ?? 8000;
      if (opts.autoDetect !== false) {
        const alive = await checkAlive(port, 1500);
        if (alive) return { status: "success", port };
      }
      try {
        const { port: launchedPort } = await launchComfyDesktop(opts);
        return { status: "success", port: launchedPort };
      } catch (error: any) {
        return { status: "error", message: String(error?.message ?? error) };
      }
    }
  );
};
