import SettingsModal from 'renderer/components/SettingsModal';
import TabBar from 'renderer/features/tab/TabBar';
import useNodeEditorSetup from 'renderer/hooks/useNodeEditorSetup';
import useMainStore from 'renderer/hooks/MainStore';
import { Toaster } from 'sonner';
import BellButton from 'renderer/features/toast-notice/BellButton';
import { useShallow } from 'zustand/react/shallow'
import { useCallback, useEffect, useState } from 'react';
import { electronApiService } from 'renderer/services/appService';
import { Button } from 'renderer/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from 'renderer/components/ui/dropdown-menu';
import { useFileOperations } from 'renderer/hooks/useFileOperations';



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
    updateFile: state.updateFile,
    clearHistory: state.clearHistory
  })));

  // Reteエディタのセットアップ
  const { ref, setCurrentFileState, clearEditorHistory } = useNodeEditorSetup(
    activeFileId,
    getGraphAndHistory,
    setGraphAndHistory
  );

  const { saveFile, closeFile, loadFile, newFile } = useFileOperations(
    files,
    activeFileId,
    setCurrentFileState,
    clearEditorHistory,
    getFileById,
    setActiveFileId,
    addFile,
    removeFile,
    updateFile,
    clearHistory,
  );

  // 設定画面を表示するか
  const [showSettings, setShowSettings] = useState(false);

  // mainからのファイル読み込み通知を受け取り、ファイルを開く
  useEffect(() => {
    const unsub = electronApiService.onFileLoadedRequest(async (e, fileData) => await loadFile(fileData));
    return () => { unsub() };
  }, [loadFile]);

  useEffect(() => {
    // 設定画面オープン指示
    const unsubOpen = electronApiService.onOpenSettings(() => setShowSettings(true));
    return () => { unsubOpen(); };
  }, [setShowSettings]);

  useEffect(() => {
    // mainからの保存指示を受け取り、現在開いているファイルを保存
    const unsubSave = electronApiService.onSaveGraphInitiate(async () => await saveFile(activeFileId));
    return () => { unsubSave() };
  }, [activeFileId, saveFile]);

  const handleNewFile = async () => {
    newFile();
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
    closeFile(id);
  };

  // ファイルを開くボタン
  const handleLoadFile = useCallback(async () => {
    const result = await electronApiService.loadFile();
    if (!result) return;
    await loadFile(result);
  }, [loadFile]);

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
              <DropdownMenuItem onClick={async () => await saveFile(activeFileId)}>Save</DropdownMenuItem>
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
