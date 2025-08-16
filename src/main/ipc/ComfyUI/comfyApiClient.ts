import { ComfyApi } from "@saintno/comfyui-sdk";

let comfyApiInstance: ComfyApi | null = null;

/**
 * ComfyApi クライアントのシングルトンインスタンスを取得
 * @param url ComfyUIサーバーのURL
 */
export function getComfyApiClient(
  url: string,
  opts?: {
    forceWs?: boolean;
    wsTimeout?: number;
  }
): ComfyApi {
  if (!comfyApiInstance) {
    comfyApiInstance = new ComfyApi(url, undefined, opts);
  }
  return comfyApiInstance;
}

export type UserdataEntry = {
  name: string;
  path: string; // 例: "workflows/My Flow.json"
  type: "file" | "dir";
};

export async function listWorkflows(api: ComfyApi): Promise<UserdataEntry[]> {
  const params = new URLSearchParams({ dir: "workflows" });

  const res = await api.fetchApi(`/userdata?${params.toString()}`);
  const data = (await res.json()) as any;
  const items: any[] = Array.isArray(data?.files)
    ? data.files
    : Array.isArray(data)
    ? data
    : [];

  return items
    .map((it: any) => {
      if (typeof it === "string") {
        return {
          name: it.split("/").pop() ?? "",
          path: `workflows/${it}`,
          type: "file" as const,
        };
      }
      return {
        name: it?.name ?? it?.path?.split("/").pop(),
        path: it?.path ?? (it?.name ? `workflows/${it.name}` : undefined),
        type: "file" as const,
      } as UserdataEntry;
    })
    .filter((e: any) => e.path);
}

/**
 * 指定ワークフロー（JSON）を取得
 * fileName: "My Flow.json"
 */
export async function getWorkflow(
  api: ComfyApi,
  fileName: string
): Promise<any> {
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
