import { ipcMain } from "electron";
import { IpcChannel, type IpcResult } from "shared/ApiType";
import type { GuiWorkflow } from "../../common/main/graph-to-prompt-strict";
import { toApiPromptStrict } from "../../common/main/graph-to-prompt-strict";
import {
  resolveWorkflowJson,
  type WorkflowRef,
} from "../../common/main/workflowResolver";

export type ReadWorkflowJsonArgs = {
  endpoint: string;
  workflowRef: WorkflowRef;
};

export type ReadWorkflowRefArgs = {
  endpoint: string;
  workflowRef: WorkflowRef;
};

export type ToApiPromptStrictArgs = {
  endpoint: string;
  workflow: unknown;
};

export const register = (): void => {
  registerReadWorkflowJsonHandler();
  registerReadWorkflowRefHandler();
  registerToApiPromptStrictHandler();
};

const registerReadWorkflowJsonHandler = (): void => {
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
};

const registerReadWorkflowRefHandler = (): void => {
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
};

const registerToApiPromptStrictHandler = (): void => {
  ipcMain.handle(
    IpcChannel.ToApiPromptStrict,
    async (_e, args: ToApiPromptStrictArgs): Promise<IpcResult<unknown>> => {
      try {
        const { endpoint, workflow } = args ?? ({} as any);
        if (!endpoint) throw new Error("endpoint is empty");
        if (!workflow) throw new Error("workflow is empty");
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
};
