import { ipcMain } from "electron";
import { IpcChannel, type IpcResult } from "shared/ApiType";
import { resolveWorkflowJson, type WorkflowRef } from "./workflowResolver";

export type ReadWorkflowJsonArgs = {
  endpoint: string;
  workflowRef: WorkflowRef;
};

/**
 * workflowRef -> raw workflow(JSON) を返す IPC handler
 */
export function registerReadWorkflowJsonHandler(): void {
  ipcMain.handle(
    IpcChannel.ReadWorkflowJson,
    async (_e, args: ReadWorkflowJsonArgs): Promise<IpcResult<unknown>> => {
      try {
        const { endpoint, workflowRef } = args ?? ({} as any);
        if (!endpoint) throw new Error("endpoint is empty");
        if (!workflowRef) throw new Error("workflowRef is empty");
        const workflow = await resolveWorkflowJson(endpoint, workflowRef);
        return { status: "success", data: workflow };
      } catch (err: any) {
        return { status: "error", message: String(err?.message ?? err) };
      }
    }
  );
}
