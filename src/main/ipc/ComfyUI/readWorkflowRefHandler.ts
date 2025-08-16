import { ipcMain } from "electron";
import { IpcChannel, type IpcResult } from "shared/ApiType";
import { getComfyApiClient, getWorkflow } from "./comfyApiClient";
import { ComfyTemplatesClient } from "./comfyTemplatesClient";
import { toApiPromptStrict } from "./graph-to-prompt-strict";

export type ReadWorkflowRefArgs = {
  endpoint: string; // 明示的に受け取る (renderer 側で他ノードから供給)
  workflowRef: { source: "userData" | "template"; name: string };
};

/** workflowRef -> 実体 JSON を取得する IPC handler */
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

async function resolveWorkflowJson(
  endpoint: string,
  workflowRef: { source: "userData" | "template"; name: string }
): Promise<any> {
  if (workflowRef.source === "template") {
    const client = new ComfyTemplatesClient(endpoint);
    return client.getTemplate(workflowRef.name);
  }
  const api = getComfyApiClient(endpoint);
  return getWorkflow(api, workflowRef.name);
}
