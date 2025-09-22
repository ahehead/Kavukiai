import { ipcMain } from "electron";
import { IpcChannel, type IpcResult } from "shared/ApiType";
import type { GuiWorkflow } from "./graph-to-prompt-strict";
import { toApiPromptStrict } from "./graph-to-prompt-strict";

export type ToApiPromptStrictArgs = {
  endpoint: string;
  workflow: unknown;
};

/**
 * workflow(JSON) -> apiPrompt 変換 IPC handler
 */
export function registerToApiPromptStrictHandler(): void {
  ipcMain.handle(
    IpcChannel.ToApiPromptStrict,
    async (_e, args: ToApiPromptStrictArgs): Promise<IpcResult<unknown>> => {
      try {
        const { endpoint, workflow } = args ?? ({} as any);
        if (!endpoint) throw new Error("endpoint is empty");
        if (!workflow) throw new Error("workflow is empty");
        // IPC 経由の型境界なので runtime validate は別途行う前提。ここでは最低限の shape チェック。
        const wf = workflow as Partial<GuiWorkflow>;
        if (!wf || !Array.isArray(wf.nodes))
          throw new Error("workflow.nodes missing");
        const apiPrompt = await toApiPromptStrict(wf as GuiWorkflow, {
          baseUrl: endpoint,
        });
        return { status: "success", data: apiPrompt };
      } catch (err: any) {
        return { status: "error", message: String(err?.message ?? err) };
      }
    }
  );
}
