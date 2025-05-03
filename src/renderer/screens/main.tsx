import SettingsModal from 'renderer/components/SettingsModal';
import TabBar from 'renderer/components/TabBar';
import useNodeEditorSetup from 'renderer/hooks/useNodeEditorSetup';
import { type MainState, convertMainToPersistedMain, createFile } from 'shared/AppType';
import { getNewActiveFileId } from "renderer/utils/tabs";
import useMainStore from 'renderer/hooks/MainStore';
import { useIsFileDirty, isFileDirty } from '../features/dirty-check/useIsFileDirty';
import { hashGraph } from 'renderer/features/dirty-check/hash';
import { Toaster } from 'sonner';
import { notify } from 'renderer/features/toast-notice/notify';
import BellButton from 'renderer/features/toast-notice/BellButton';
import { useShallow } from 'zustand/react/shallow'
import { useCallback, useEffect, useState } from 'react';
import { CloseFileDialogResponse } from 'shared/ApiType';
import { electronApiService } from 'renderer/services/appService';



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
  const { ref, setCurrentFileState } = useNodeEditorSetup(
    activeFileId,
    getGraphAndHistory,
    setGraphAndHistory
  );

  // 設定画面を表示するか
  const [showSettings, setShowSettings] = useState(false);

  // 編集状況がファイルに保存済みかどうか
  const isDirty = useIsFileDirty(activeFileId);

  const handleNewFile = async () => {
    // 新規作成前に、現在のファイル状態を保存
    setCurrentFileState();
    //setActiveFileId(null);

    const id = crypto.randomUUID();
    const title = `Untitled-${files.length + 1}`;
    const file = await createFile(id, title);
    addFile(file);
    setActiveFileId(id);
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
    const isCloseFileDirty = await isFileDirty(getFileById(id));
    if (isCloseFileDirty) {
      const { response } = await electronApiService.showCloseConfirm();
      // キャンセル
      if (response === CloseFileDialogResponse.Cancel) return;
      // 保存
      if (response === CloseFileDialogResponse.Confirm) {
        const ok = await onFileSave();
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
    async (): Promise<boolean> => {
      if (!activeFileId || !isDirty) return false;
      setCurrentFileState();

      const f = getFileById(activeFileId);
      if (!f) return false;

      let filePath = f.path;
      if (!filePath) {
        filePath = await electronApiService.showSaveDialog(f.title);
        if (!filePath) return false;      // ユーザーがキャンセル
      }
      const newFilePath = await electronApiService.saveGraphJsonData(filePath, f.graph, f.graphHash);
      if (!newFilePath) {
        notify("error", "ファイルの保存に失敗しました");
        return false;                     // 保存失敗
      }
      updateFile(activeFileId, {
        title: newFilePath.split('/').pop() || f.title,
        path: newFilePath,
        graphHash: await hashGraph(f.graph)
      });
      clearHistory(activeFileId);
      notify("success", "ファイルを保存しました");
      return true;                        // 保存成功
    },
    [activeFileId, isDirty, getFileById, setCurrentFileState, updateFile, clearHistory]
  );

  useEffect(() => {
    // 起動時にアプリの状態を復元
    electronApiService.loadAppStateSnapshot().then((res: MainState) => {
      setMainState(res);
    });
  }, [setMainState]);

  useEffect(() => {
    const unsub = electronApiService.onFileLoadedRequest(async (e, path, fileName, json) => {
      // ファイル読み込み前に、現在のファイル状態を保存
      setCurrentFileState();
      // 同じハッシュのファイルが有れば、それにフォーカスして終了
      const hash = await hashGraph(json);
      const sameFile = files.find((f) => f.graphHash === hash);
      if (sameFile) {
        setActiveFileId(sameFile.id);
        return;
      }

      // ファイルの新規作成
      const id = crypto.randomUUID();
      const file = await createFile(id, fileName, json, path);
      addFile(file);
      setActiveFileId(id);
    });
    return () => unsub();
  }, [files, addFile, setActiveFileId, setCurrentFileState]);

  useEffect(() => {
    // 設定画面オープン指示
    const unsubOpen = electronApiService.onOpenSettings(() => {
      setShowSettings(true);
    });

    // useMainStoreに変更があったら、アプリの状態をスナップショットする
    const unsubscribe = useMainStore.subscribe(
      (s) => ({
        version: s.version,
        files: s.files,
        settings: { ui: s.settings.ui },
        activeFileId: s.activeFileId,
      }),
      (appState) => {
        electronApiService.takeAppStateSnapshot(convertMainToPersistedMain(appState));
      }
    );

    // 保存要請の解除関数を取得
    const unsubSave = electronApiService.onSaveGraphInitiate(onFileSave);

    return () => {
      unsubOpen();
      unsubSave();
      unsubscribe();
    };
  }, [onFileSave, setShowSettings]);

  return (
    <main className="flex flex-col fixed inset-0 border-t">
      {files.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-blue-50">
          <button
            className="px-4 py-2 bg-white rounded"
            onClick={handleNewFile}
          >
            新規作成hi
          </button>
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
      <div className="flex justify-end">
        <BellButton />
        <Toaster richColors={true} expand={true} />
      </div>
      {
        // 設定画面
        showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} />
        )
      }
    </main >
  )
}
