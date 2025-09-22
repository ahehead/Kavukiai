import { ipcMain } from "electron";
import { IpcChannel, type IpcResult } from "shared/ApiType";
import { toApiPromptStrict } from "./graph-to-prompt-strict";
import { resolveWorkflowJson } from "./workflowResolver";

export type ReadWorkflowRefArgs = {
  endpoint: string; // 明示的に受け取る (renderer 側で他ノードから供給)
  workflowRef: { source: "userData" | "template"; name: string };
};

/**
 * (Deprecated) workflowRef -> apiPrompt 直接変換する旧ハンドラ
 * 新: IpcChannel.ReadWorkflowJson + IpcChannel.ToApiPromptStrict を段階的に利用してください。
 */
export function registerReadWorkflowRefHandler(): void {
  ipcMain.handle(
    IpcChannel.ReadWorkflowRef,
    async (_e, args: ReadWorkflowRefArgs): Promise<IpcResult<unknown>> => {
      try {
        const { endpoint, workflowRef } = args ?? ({} as any);
        if (!endpoint) throw new Error("endpoint is empty");
        if (!workflowRef) throw new Error("workflowRef is empty");
        const workflow = await resolveWorkflowJson(endpoint, workflowRef);
        const apiPrompt = await toApiPromptStrict(workflow, {
          baseUrl: endpoint,
        });
        return { status: "success", data: apiPrompt };
      } catch (err: any) {
        return { status: "error", message: String(err?.message ?? err) };
      }
    }
  );
}
