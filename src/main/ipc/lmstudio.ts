import { ipcMain } from "electron";
import type { ModelInfo } from "@lmstudio/sdk";
import { IpcChannel, type IpcResult } from "shared/ApiType";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

const execFileAsync = promisify(execFile);

async function listModelsViaCli(): Promise<ModelInfo[] | null> {
  try {
    // --quiet: 余計なログを抑止,  --json: 機械可読
    const { stdout } = await execFileAsync("lms", ["ls", "--json", "--quiet"], {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    });
    // CLI の JSON 形式は SDK ModelInfo と互換
    return JSON.parse(stdout) as ModelInfo[];
  } catch {
    return null; // CLI が見つからない or 失敗
  }
}

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
}
