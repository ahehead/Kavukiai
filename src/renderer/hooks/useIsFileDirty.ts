// hooks/useIsFileDirty.ts
import { useEffect, useState } from "react";
import useMainStore from "./MainStore";
import { hashGraph } from "../utils/hash";

export const useIsFileDirty = (fileId: string | null) => {
  const file = useMainStore(
    (s) => s.files.find((f) => f.id === fileId) // selector = sync
  );

  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!file) return setDirty(false);

      console.log("useIsFileDirty", file.historyState.produced.length);

      // ①履歴ですぐ判定
      if (file.historyState.produced.length > 0) {
        return setDirty(true);
      }

      // ②ハッシュでダブルチェック
      const same = (await hashGraph(file.graph)) === file.graphHash;
      if (!cancelled) setDirty(!same);
    })();

    return () => {
      cancelled = true;
    };
  }, [file]);

  return dirty;
};
