import SettingsModal from 'renderer/components/SettingsModal';
import TabBar from 'renderer/features/tab/TabBar';
import useNodeEditorSetup from 'renderer/hooks/useNodeEditorSetup';
import { createFile } from 'shared/AppType';
import { getNewActiveFileId } from "renderer/features/tab/getNewFileId";
import useMainStore from 'renderer/hooks/MainStore';
import { isFileDirty } from '../features/dirty-check/useIsFileDirty';
import { hashGraph } from 'renderer/features/dirty-check/hash';
import { Toaster } from 'sonner';
import { notify } from 'renderer/features/toast-notice/notify';
import BellButton from 'renderer/features/toast-notice/BellButton';
import { useShallow } from 'zustand/react/shallow'
import { useCallback, useEffect, useState } from 'react';
import { CloseFileDialogResponse, type FileData } from 'shared/ApiType';
import { electronApiService } from 'renderer/services/appService';
import { Button } from 'renderer/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from 'renderer/components/ui/dropdown-menu';
import type { GraphJsonData } from 'shared/JsonType';



export function MainScreen() {
  const {
    files,
    activeFileId,
    getFileById,
    addFile,
    removeFile,
    setActiveFileId,
    setGraphAndHistory,
    getGraphAndHistory,
    setMainState,
    updateFile,
    clearHistory
  } = useMainStore(useShallow(state => ({
    files: state.files,
    activeFileId: state.activeFileId,
    getFileById: state.getFileById,
    addFile: state.addFile,
    removeFile: state.removeFile,
    setActiveFileId: state.setActiveFileId,
    setGraphAndHistory: state.setGraphAndHistory,
    getGraphAndHistory: state.getGraphAndHistory,
    setMainState: state.setMainState,
    updateFile: state.updateFile,
    clearHistory: state.clearHistory
  })));

  // Reteエディタのセットアップ
  const { ref, setCurrentFileState, clearEditorHistory } = useNodeEditorSetup(
    activeFileId,
    getGraphAndHistory,
    setGraphAndHistory
  );

  // 設定画面を表示するか
  const [showSettings, setShowSettings] = useState(false);

  const handleNewFile = async () => {
    // 新規作成前に、現在のファイル状態を保存
    setCurrentFileState();
    const title = `workspace-${files.length + 1}`;
    addFile(await createFile(title));
  };

  // タブ選択
  const handleSelect = (id: string) => {
    // 選択前のファイルの状態を保存
    setCurrentFileState();
    setActiveFileId(id);
  };


  // ファイルを閉じる
  const handleCloseFile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // 閉じる前に、現在の編集状態を保存
    setCurrentFileState();

    // ダーティ判定
    if (await isFileDirty(getFileById(id))) {
      const { response } = await electronApiService.showCloseConfirm();
      // キャンセル
      if (response === CloseFileDialogResponse.Cancel) return;
      // 保存
      if (response === CloseFileDialogResponse.Confirm) {
        const ok = await onFileSave(id);
        if (!ok) return;                 // キャンセル/失敗なら中断
      }
      // 「保存しない(response===1)」はそのまま破棄
    }

    // タブ削除 & 新規アクティブ決定
    const nextActive = getNewActiveFileId(files, id, activeFileId);
    removeFile(id);
    setActiveFileId(nextActive);
  };

  // 保存処理（戻り値: true=保存成功 or 不要, false=キャンセル/失敗）
  const onFileSave = useCallback(
    async (fileId: string | null): Promise<boolean> => {
      if (!fileId) return true;
      setCurrentFileState();
      const f = getFileById(fileId);
      if (!f) return true;

      if (!await isFileDirty(f)) return true;

      // filePathが無ければ、保存したことがないので、ダイアログを表示
      let filePath = f.path;
      if (!filePath) {
        filePath = await electronApiService.showSaveDialog(f.title);
        if (!filePath) return false;      // ユーザーがキャンセル
      }

      // 同じファイルを上書きするときだけ lastHash を送る
      const lastHash = (filePath === f.path) ? f.graphHash : undefined;

      // グラフを保存
      const result = await electronApiService.saveGraphJsonData(filePath, f.graph, lastHash);
      if (!result) {
        notify("error", `ファイルの保存に失敗しました: ${f.title}`);
        return false;                     // 保存失敗
      }
      updateFile(fileId, {
        title: result.fileName,
        path: result.filePath,
        graph: f.graph,
        graphHash: await hashGraph(f.graph)
      });
      clearHistory(fileId);
      if (fileId === activeFileId) { clearEditorHistory(f.graph); }
      notify("success", `ファイルを保存: ${result.fileName}`);
      return true;                        // 保存成功
    },
    [activeFileId, getFileById, setCurrentFileState, updateFile, clearHistory, clearEditorHistory]
  );

  const getSameFile = useCallback(
    async (json: GraphJsonData) => {
      const hash = await hashGraph(json);
      return files.find((f) => f.graphHash === hash);
    }, [files]);

  // ファイルを読み込む処理
  const onLoadFile = useCallback(
    async ({ filePath, fileName, json }: FileData) => {
      // ファイル読み込み前に、現在のファイル状態をMainStoreに反映
      setCurrentFileState();
      // 同じハッシュのファイルが有れば、それにフォーカスして終了
      const sameFile = await getSameFile(json);
      if (sameFile) {
        setActiveFileId(sameFile.id);
        return;
      }
      // ファイルの新規作成追加
      addFile(await createFile(fileName, json, filePath));
    }, [files, setCurrentFileState, addFile, setActiveFileId]);


  // mainからのファイル読み込み通知を受け取り、ファイルを開く
  useEffect(() => {
    const unsub = electronApiService.onFileLoadedRequest(async (e, fileData) => await onLoadFile(fileData));
    return () => { unsub() };
  }, [onLoadFile]);

  useEffect(() => {
    // 設定画面オープン指示
    const unsubOpen = electronApiService.onOpenSettings(() => setShowSettings(true));
    return () => { unsubOpen(); };
  }, [setShowSettings]);

  useEffect(() => {
    // mainからの保存指示を受け取り、現在開いているファイルを保存
    const unsubSave = electronApiService.onSaveGraphInitiate(async () => await onFileSave(activeFileId));
    return () => { unsubSave() };
  }, [activeFileId, onFileSave]);

  // ファイルを開くボタン
  const handleLoadFile = useCallback(async () => {
    const result = await electronApiService.loadFile();
    if (!result) return;
    await onLoadFile(result);
  }, [onLoadFile]);

  return (
    <div className="flex flex-col fixed inset-0">
      {/* タイトルバー */}
      <div className="flex titlebar bg-titlebar" >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className='text-foreground font-bold '
              variant="ghost"
            >
              File
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={async () => await onFileSave(activeFileId)}>Save</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLoadFile}>Open</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* メインコンテンツ */}
      <main className="flex flex-1 flex-col border-t">
        {files.length === 0 ? (
          <div className="flex-1 flex items-center justify-center bg-blue-100 border-8 rounded-lg border-white">
            <div className='flex flex-col items-start dialog-animate-up'>
              <ul className=''>
                <li className="mb-2  rounded hover:bg-gray-100 bg-background">
                  <button
                    className="px-4 py-2"
                    onClick={handleNewFile}
                  >
                    ・ 新規作成
                  </button>
                </li>
                <li className='mb-2 bg-background rounded hover:bg-gray-100'>
                  <button
                    className="px-4 py-2"
                    onClick={handleNewFile}
                  >
                    ・ テンプレートから作成
                  </button>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <TabBar
            files={files}
            activeFileId={activeFileId}
            onSelect={handleSelect}
            onClose={handleCloseFile}
            onNewFile={handleNewFile}
          />
        )}
        {/* editor: 常にレンダーする。ファイルなし時はdisplay none */}
        <div
          className="App flex-1 w-full h-full"
          style={{ display: files.length === 0 ? 'none' : 'block' }}
        >
          <div ref={ref} className="w-full h-full" />
        </div>
        {/* 通知ベル */}
        <div className=" justify-end bg-gray-100 "
          style={{ display: files.length === 0 ? 'none' : "flex" }}>
          <BellButton />
        </div>
        {
          // 設定画面
          showSettings && (
            <SettingsModal onClose={() => setShowSettings(false)} />
          )
        }
        <Toaster richColors={true} expand={true} offset={5} />
      </main >
    </div>
  )
}
