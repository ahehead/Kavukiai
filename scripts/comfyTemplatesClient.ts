// comfyTemplates.ts
export type TemplateMeta = {
  name: string; // 例: "flux_dev_basic"
  title?: string; // 表示名（あれば）
  moduleName?: string; // "default" (内蔵) など
  categoryTitle?: string; // "Basics" など
  description?: string;
  mediaType?: string;
  mediaSubtype?: string;
  tutorialUrl?: string;
  url: string; // JSON の取得 URL (/templates/xxx.json)
};

export class ComfyTemplatesClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
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
        `HTTP ${res.status} ${res.statusText} for ${path}${
          body ? `: ${body.slice(0, 400)}` : ""
        }`
      );
    }
    return res;
  }

  /**
   * 内蔵テンプレートの一覧を取得
   * 1) /api/workflow_templates → 2) /workflow_templates → 3) /templates/index.json の順でフォールバック
   */
  async listTemplates(): Promise<TemplateMeta[]> {
    // 1) /api/workflow_templates
    for (const path of ["/api/workflow_templates", "/workflow_templates"]) {
      try {
        const res = await this.doFetch(path);
        const data = await res.json();

        // 形はバージョンで差があるので緩めに吸収
        // 新しめ: { categories: [{ moduleName, title, type, templates: [{ name, ... }] }] } に近い構造
        const categories =
          data?.categories && Array.isArray(data.categories)
            ? data.categories
            : Array.isArray(data)
            ? data
            : [];

        if (categories.length) {
          const out: TemplateMeta[] = [];
          for (const cat of categories) {
            const moduleName = cat?.moduleName ?? "default";
            const categoryTitle = cat?.title;
            const tpls = Array.isArray(cat?.templates) ? cat.templates : [];
            for (const t of tpls) {
              if (!t?.name) continue;
              // 内蔵テンプレは /templates/<name>.json が基本
              const url = `/templates/${t.name}.json`;
              out.push({
                name: t.name,
                title: t.title ?? t.displayName,
                moduleName,
                categoryTitle,
                description: t.description,
                mediaType: t.mediaType,
                mediaSubtype: t.mediaSubtype,
                tutorialUrl: t.tutorialUrl,
                url,
              });
            }
          }
          if (out.length) return out;
        }

        // 古い/実装差分: モジュール名 → テンプレ名配列 のマップ形式など
        // { "<module>": ["foo", "bar"] }
        if (data && typeof data === "object" && !("categories" in data)) {
          const out: TemplateMeta[] = [];
          for (const [mod, arr] of Object.entries<any>(data)) {
            if (!Array.isArray(arr)) continue;
            for (const name of arr) {
              out.push({
                name: String(name),
                moduleName: String(mod),
                url: `/templates/${String(name)}.json`, // だいたいこれで取れる
              });
            }
          }
          if (out.length) return out;
        }
      } catch {
        console.log("Failed:", path);
        // 次の候補へ
      }
    }

    console.log("Failed:");
    // 3) 最終手段: 静的 index.json を読む（内蔵テンプレの定義ファイル）
    // https://github.com/Comfy-Org/workflow_templates/tree/main/templates に相当
    const res = await this.doFetch("/templates/index.json");
    const idx = await res.json();
    const categories = Array.isArray(idx)
      ? idx
      : Array.isArray(idx?.categories)
      ? idx.categories
      : [];
    const out: TemplateMeta[] = [];
    for (const cat of categories) {
      const moduleName = cat?.moduleName ?? "default";
      const categoryTitle = cat?.title;
      const tpls = Array.isArray(cat?.templates) ? cat.templates : [];
      for (const t of tpls) {
        if (!t?.name) continue;
        out.push({
          name: t.name,
          title: t.title ?? t.displayName,
          moduleName,
          categoryTitle,
          description: t.description,
          mediaType: t.mediaType,
          mediaSubtype: t.mediaSubtype,
          tutorialUrl: t.tutorialUrl,
          url: `/templates/${t.name}.json`,
        });
      }
    }
    return out;
  }

  /** 指定テンプレートの JSON を取得（name でも URL でも可） */
  async getTemplate(nameOrUrl: string): Promise<any> {
    const url =
      nameOrUrl.startsWith("http") || nameOrUrl.endsWith(".json")
        ? nameOrUrl
        : `/templates/${nameOrUrl}.json`;

    const res = await this.doFetch(url);
    return await res.json();
  }
}

async function main() {
  const api = new ComfyTemplatesClient("http://127.0.0.1:8000");

  // 1) 一覧を取得（name と url が手に入る）
  const templates = await api.listTemplates();
  console.log(
    templates.map((t) => `${t.categoryTitle ?? t.moduleName}: ${t.name}`)
  );
}

main();
