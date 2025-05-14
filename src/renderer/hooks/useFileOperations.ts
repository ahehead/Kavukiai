import { useCallback } from "react";
import { electronApiService } from "../services/appService";
import { isFileDirty } from "../features/dirty-check/useIsFileDirty";
import { hashGraph } from "../features/dirty-check/hash";
import { notify } from "../features/toast-notice/notify";
import { CloseFileDialogResponse, type FileData } from "shared/ApiType";
import { getNewActiveFileId } from "renderer/features/tab/getNewFileId";
import { createFile, type File } from "shared/AppType";
import type { GraphJsonData } from "shared/JsonType";

export function useFileOperations(
  files: File[],
  activeFileId: string | null,
  setCurrentFileState: () => void,
  clearEditorHistory: (graph: GraphJsonData) => void,
  getFileById: (id: string) => File | undefined,
  setActiveFileId: (id: string | null) => void,
  addFile: (file: File) => void,
  removeFile: (id: File["id"]) => void,
  updateFile: (id: File["id"], updates: Partial<File>) => void,
  clearHistory: (id: File["id"]) => void
) {
  const saveFile = useCallback(
    async (fileId: string | null): Promise<boolean> => {
      if (!fileId) return true;
      setCurrentFileState();
      const f = getFileById(fileId);

      if (!f || !(await isFileDirty(f))) return true;

      let currentFilePath = f.path;
      // filePathが無ければ、保存したことがないので、ダイアログを表示
      if (!currentFilePath) {
        currentFilePath = await electronApiService.showSaveDialog(f.title);
        if (!currentFilePath) return false; // ユーザーがキャンセル
      }

      // 同じファイルを上書きするときだけ lastHash を送る
      const lastHash = currentFilePath === f.path ? f.graphHash : undefined;

      // グラフを保存
      const result = await electronApiService.saveGraphJsonData(
        currentFilePath,
        f.graph,
        lastHash
      );
      if (result.status === "cancel") {
        notify("info", "保存キャンセル");
        return false; // ユーザーがキャンセル
      }
      if (result.status === "error") {
        notify("error", `保存失敗: ${result.message}`);
        return false; // 保存失敗
      }
      const { filePath, fileName } = result.data;

      updateFile(fileId, {
        title: fileName,
        path: filePath,
        graph: f.graph,
        graphHash: await hashGraph(f.graph),
      });
      clearHistory(fileId);
      if (fileId === activeFileId) {
        clearEditorHistory(f.graph);
      }
      notify("success", `保存しました: ${fileName}`);
      return true; // 保存成功
    },
    [
      activeFileId,
      getFileById,
      setCurrentFileState,
      updateFile,
      clearHistory,
      clearEditorHistory,
    ]
  );

  // ファイルを読み込む処理
  const loadFile = useCallback(
    async ({ filePath, fileName, json }: FileData) => {
      setCurrentFileState();
      // 同じハッシュのファイルが有れば、それにフォーカスして終了
      const sameFile = await getSameFile(json);
      if (sameFile) {
        setActiveFileId(sameFile.id);
        return;
      }
      // ファイルの新規作成追加
      addFile(await createFile(fileName, json, filePath));
    },
    [files, setCurrentFileState, addFile, setActiveFileId]
  );

  const closeFile = useCallback(
    async (id: string) => {
      setCurrentFileState();

      // ダーティ判定
      if (await isFileDirty(getFileById(id))) {
        const { response } = await electronApiService.showCloseConfirm();
        if (response === CloseFileDialogResponse.Cancel) return;
        if (response === CloseFileDialogResponse.Confirm) {
          const ok = await saveFile(id);
          if (!ok) return; // キャンセル/失敗なら中断
        }
        // 「保存しない(response===1)」はそのまま破棄
      }

      // タブ削除 & 新規アクティブ決定
      const nextActive = getNewActiveFileId(files, id, activeFileId);
      removeFile(id);
      setActiveFileId(nextActive);
    },
    [activeFileId, files, getFileById, removeFile, setActiveFileId, saveFile]
  );

  const getSameFile = useCallback(
    async (json: GraphJsonData) => {
      const hash = await hashGraph(json);
      return files.find((f) => f.graphHash === hash);
    },
    [files]
  );

  const newFile = useCallback(async () => {
    // 新規作成前に、現在のファイル状態を保存
    setCurrentFileState();
    const title = `workspace-${files.length + 1}`;
    addFile(await createFile(title));
  }, [addFile, setCurrentFileState]);

  return { saveFile, loadFile, closeFile, newFile };
}
