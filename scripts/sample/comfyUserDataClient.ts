// comfyUserdata.ts
export type UserdataEntry = {
  name: string;
  path: string; // 例: "workflows/My Flow.json"
  type: "file" | "dir";
};

export class ComfyUserdataClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, ""); // 末尾スラッシュ除去
    this.apiKey = apiKey;
  }

  private async doFetch(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (this.apiKey) headers.set("Authorization", `Bearer ${this.apiKey}`);

    const res = await fetch(`${this.baseUrl}${path}`, { ...init, headers });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `HTTP ${res.status} ${res.statusText} for ${path}` +
          (body ? `: ${body.slice(0, 400)}` : "")
      );
    }
    return res;
  }

  /**
   * ワークフロー一覧（既定: user/default/workflows）
   */
  async listWorkflows(): Promise<UserdataEntry[]> {
    const params = new URLSearchParams({ dir: "workflows" });

    const res = await this.doFetch(`/userdata?${params.toString()}`);
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

  // /**
  //  * 指定ワークフロー（JSON）を取得
  //  * fileNameOrPath: "My Flow.json" でも "workflows/My Flow.json" でも可
  //  */
  // async getWorkflow(fileNameOrPath: string): Promise<any> {
  //   const relPath = fileNameOrPath.includes("/")
  //     ? fileNameOrPath
  //     : `workflows/${fileNameOrPath}`;

  //   // /userdata/{file} はパス区切りを %2F として渡すのが安全
  //   // （URLデコード不具合は v0.2.3 で修正済み）:contentReference[oaicite:2]{index=2}
  //   const encoded = encodeURIComponent(relPath);
  //   const res = await this.doFetch(`/userdata/${encoded}`);
  //   const text = await res.text();
  //   try {
  //     return JSON.parse(text);
  //   } catch {
  //     throw new Error(
  //       `JSON ではない応答を受け取りました (${relPath}): ${text.slice(0, 120)}`
  //     );
  //   }
  // }
}

// async function main() {
//   const api = new ComfyUserdataClient("http://127.0.0.1:8000"); // 逆プロキシ配下なら 'http://host/api' のように

//   // 1) 一覧
//   const workflows = await api.listWorkflows();
//   console.log(workflows);

//   // 2) 指定ファイルを取得（名前だけでも OK）
//   const wf = await api.getWorkflow("Unsaved Workflow.json");
//   // or: const wf = await api.getWorkflow('workflows/My Flow.json')
//   console.log(wf); // ComfyUI のワークフロー JSON
// }
