import { useEffect, useRef, useState } from 'react'
import SettingsModal from 'renderer/components/SettingsModal';
import { createNodeEditor } from 'renderer/nodeEditor/createNodeEditor';
import { useRete } from "rete-react-plugin";
import { createAppState, createFile, type AppState } from 'shared/AppType';
import { X, Plus, Circle } from 'lucide-react';
import { createNodeEditorState, type NodeEditorState } from 'renderer/nodeEditor/features/editor_state/historyState';
const { App } = window

export function MainScreen() {
  const [ref, editorApi] = useRete(createNodeEditor);
  // 設定画面を表示するか
  const [showSettings, setShowSettings] = useState(false);

  // アプリ全体の状態
  const [appState, setAppState] = useState<AppState>(createAppState());
  // 前回ファイルIDを覚えておく
  const prevFileId = useRef<string | null>(null);
  // 各ファイルの履歴状態とグラフ状態を保存するマップ
  const fileStates = useRef<Map<string, NodeEditorState>>(new Map());

  // 最初のファイルIDを覚えておく
  useEffect(() => { prevFileId.current = appState.activeFileId }, []);

  // 新規ファイル追加
  const handleNewFile = () => {
    const id = crypto.randomUUID();
    const title = `Untitled-${appState.files.length + 1}`;
    const file = createFile(id, title);
    setAppState(prev => ({
      ...prev,
      files: [...prev.files, file],
      activeFileId: id
    }));

    // 新規ファイルの初期履歴状態を保存
    if (editorApi) {
      fileStates.current.set(id, createNodeEditorState(file.graph));
    }
    // prevFileId を新規ファイルID に更新
    prevFileId.current = id;
  };

  // idからfileを取り出す
  const getFileById = (id: string) => {
    return appState.files.find(file => file.id === id);
  };

  // タブ選択
  const handleSelect = (id: string) => {
    if (editorApi && prevFileId.current) {
      // console.log("tab select mae", editorApi.extractHistoryState());
      fileStates.current.set(prevFileId.current, editorApi.getCurrentEditorState());
    }
    prevFileId.current = id;
    setAppState(prev => ({ ...prev, activeFileId: id }));
  };

  // ファイルID が変わったら保存済み state を復元
  useEffect(() => {
    if (!editorApi || !appState.activeFileId) return;
    (async () => {
      if (!appState.activeFileId) return;
      const state = fileStates.current.get(appState.activeFileId);
      if (state) {
        await editorApi.resetEditorState(state);
      }
    })();
  }, [editorApi, appState.activeFileId]);
  // ファイルを閉じる（左隣タブを選択）
  const handleCloseFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // 閉じたファイルの履歴状態を削除
    fileStates.current.delete(id);
    setAppState(prev => {
      const idx = prev.files.findIndex(f => f.id === id);
      const newFiles = prev.files.filter(f => f.id !== id);
      let newActive = prev.activeFileId;
      if (prev.activeFileId === id) {
        if (newFiles.length > 0) {
          const leftIdx = idx - 1 < 0 ? 0 : idx - 1;
          newActive = newFiles[leftIdx].id;
        } else {
          newActive = '';
        }
      }
      return { ...prev, files: newFiles, activeFileId: newActive };
    });
  };

  useEffect(() => {

    App.onOpenSettings(() => {
      setShowSettings(true)
    });

    App.loadAppState().then((res: AppState) => {
      setAppState(res);
    }
    )
  }, [])

  return (
    <main className="flex flex-col fixed inset-0 border-t">
      {appState.files.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-blue-50">
          <button
            className="px-4 py-2 bg-white rounded"
            onClick={handleNewFile}
          >
            新規作成hi
          </button>
        </div>
      ) : (
        <>
          {/* tabs */}
          <div className="flex border-b bg-gray-200">
            <div className="flex flex-nowrap overflow-hidden">
              {appState.files.map(file => (
                // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                <div
                  key={file.id}
                  onClick={() => handleSelect(file.id)}
                  className={`flex min-w-0 items-center pl-3 pr-2 py-2 cursor-pointer ${appState.activeFileId === file.id
                    ? ' bg-white rounded-t-lg'
                    : ' bg-gray-200'
                    }`}
                >
                  {/* file name */}
                  <span className="flex-shrink min-w-0 truncate whitespace-nowrap mr-1">
                    {file.title}
                  </span>
                  {/* close button */}
                  {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                  <span
                    onClick={e => handleCloseFile(file.id, e)}
                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-300 rounded-md"
                  >
                    {file.isDirty ? (
                      <span className="text-gray-600">
                        <Circle className="w-3 h-3" fill="#4a5565" />
                      </span>
                    ) : (
                      <span className="text-gray-600">
                        <X className="w-4 h-4" />
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div >
            {/* new file button */}
            < div className="flex flex-1 items-center pl-2 flex-shrink-0" >
              <button
                onClick={handleNewFile}
                className="w-5 h-5 flex items-center justify-center hover:bg-gray-300 rounded-md"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )
      }
      {/* editor: 常にレンダーするが、ファイルなし時は非表示 */}
      <div
        className="App flex-1 w-full h-full"
        style={{ display: appState.files.length === 0 ? 'none' : 'block' }}
      >
        <div ref={ref} className="w-full h-full" />
      </div>
      {
        showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} />
        )
      }
    </main >
  )
}
