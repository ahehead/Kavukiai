import stringify from "fast-json-stable-stringify";
import type { GraphJsonData } from "shared/JsonType";
import type { File } from "shared/AppType";

/* ---------- 1. ハッシュ関数 (環境自動切替) ---------- */
export async function sha256Hex(data: string): Promise<string> {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    // Browser / Electron renderer (nodeIntegration: false)
    const buf = await window.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(data)
    );
    return [...new Uint8Array(buf)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Node.js / Electron main / preload
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(data).digest("hex");
}

export const hashGraph = async (g: GraphJsonData): Promise<string> =>
  sha256Hex(stringify(g));

export const isFileDirty = async (file: File): Promise<boolean> => {
  if (file.historyState.produced.length > 0) return true; // ①履歴
  return (await hashGraph(file.graph)) !== file.graphHash; // ②ハッシュ
};
