import { useRete } from "rete-react-plugin";
import { createNodeEditor } from "renderer/nodeEditor/createNodeEditor";
import { useCallback, useEffect } from "react";
import type { NodeEditorState } from "renderer/nodeEditor/features/editor_state/historyState";

export default function useNodeEditorSetup(
  activeFileId: string | null,
  getGraphAndHistory: (id: string) => NodeEditorState | undefined,
  setGraphAndHistory: (id: string, state: NodeEditorState) => void
) {
  // Reteエディタのインスタンスを取得
  const [ref, editorApi] = useRete(createNodeEditor);

  // 現在のエディタの状態を取得して、MainStoreに反映
  const setCurrentFileState = useCallback(() => {
    if (editorApi && activeFileId) {
      setGraphAndHistory(activeFileId, editorApi.getCurrentEditorState());
    }
  }, [editorApi, activeFileId, setGraphAndHistory]);

  // activeFileId 変更時にエディタ状態をそのファイルの状態に復元
  useEffect(() => {
    if (!editorApi || !activeFileId) return;
    (async () => {
      const state = getGraphAndHistory(activeFileId);
      if (state) await editorApi.resetEditorState(state);
    })();
  }, [editorApi, activeFileId, getGraphAndHistory]);

  // 履歴変更時にエディタの状態を取得する関数を登録
  useEffect(() => {
    if (!editorApi) return;
    const unsub = editorApi.patchHistoryAdd(setCurrentFileState);
    return () => {
      unsub();
    };
  }, [editorApi, setCurrentFileState]);

  return { ref, setCurrentFileState };
}
