// hooks/useIsFileDirty.ts
import { useEffect, useState } from "react";
import useMainStore from "renderer/hooks/MainStore";
import type { File } from "shared/AppType";
import { hashGraph } from "./hash";

export const useIsFileDirty = (fileId: string | null) => {
  const file = useMainStore((s) => s.files.find((f) => f.id === fileId));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const d = await isFileDirty(file);
      if (!cancelled) setDirty(d);
    })();
    return () => {
      cancelled = true;
    };
  }, [file]);

  return dirty;
};

export async function isFileDirty(file?: File): Promise<boolean> {
  if (!file) return false;
  // ① 履歴があればダーティ
  if (file.historyState.produced.length > 0) return true;
  // ② ハッシュ比較
  const same = (await hashGraph(file.graph)) === file.graphHash;
  return !same;
}
