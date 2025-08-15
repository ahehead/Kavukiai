import { ipcRenderer } from "electron";
import { IpcChannel } from "shared/ApiType";
import type {
  ComfyUIRunRequestArgs,
  LaunchComfyDesktopResult,
  LaunchOpts,
} from "shared/ComfyUIType";

export const comfyuiApi = {
  runRecipe: ({ id, recipe }: ComfyUIRunRequestArgs) => {
    const { port1, port2 } = new MessageChannel();
    ipcRenderer.postMessage(IpcChannel.PortComfyUIRunRecipe, { id, recipe }, [
      port2,
    ]);
    window.postMessage({ type: "node-port", id }, "*", [port1]);
  },
  listUserWorkflows: async (endpoint: string): Promise<string[]> => {
    const res = await ipcRenderer.invoke(
      IpcChannel.ListComfyUserWorkflows,
      endpoint
    );
    if (res?.status === "success") return res.data as string[];
    throw new Error(res?.message || "Failed to list user workflows");
  },
  listTemplateWorkflows: async (endpoint: string): Promise<string[]> => {
    const res = await ipcRenderer.invoke(
      IpcChannel.ListComfyTemplateWorkflows,
      endpoint
    );
    if (res?.status === "success") return res.data as string[];
    throw new Error(res?.message || "Failed to list template workflows");
  },
  launchDesktop: async (
    opts: LaunchOpts = {}
  ): Promise<LaunchComfyDesktopResult> => {
    return ipcRenderer.invoke(IpcChannel.LaunchComfyDesktop, opts);
  },
  readWorkflowRef: async (args: {
    endpoint: string;
    workflowRef: { source: "userData" | "template"; name: string };
  }): Promise<any> => {
    const res = await ipcRenderer.invoke(IpcChannel.ReadWorkflowRef, args);
    if (res?.status === "success") return res.data;
    throw new Error(res?.message || "Failed to read workflowRef");
  },
};
