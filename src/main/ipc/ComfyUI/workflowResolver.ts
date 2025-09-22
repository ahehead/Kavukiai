import type { ComfyApi } from "@saintno/comfyui-sdk";
import { getComfyApiClient } from "./comfyApiClient";
import { ComfyTemplatesClient } from "./comfyTemplatesClient";

export type WorkflowRef = { source: "userData" | "template"; name: string };

/**
 * workflowRef を Comfy の実体 JSON (raw workflow) に解決する共通 util
 */
export async function resolveWorkflowJson(
  endpoint: string,
  workflowRef: WorkflowRef
): Promise<any> {
  if (workflowRef.source === "template") {
    const client = new ComfyTemplatesClient(endpoint);
    return client.getTemplate(workflowRef.name);
  }
  const api = getComfyApiClient(endpoint);
  return getWorkflow(api, workflowRef.name);
}

/**
 * 指定ワークフロー（JSON）を取得
 * fileName: "My Flow.json"
 */
async function getWorkflow(api: ComfyApi, fileName: string): Promise<any> {
  const res = await api.getUserData(`workflows/${fileName}`);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `JSON ではない応答を受け取りました (${fileName}): ${text.slice(0, 120)}`
    );
  }
}
