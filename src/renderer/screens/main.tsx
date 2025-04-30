import { useEffect, useState } from 'react'
import SettingsModal from 'renderer/components/SettingsModal';
import { createNodeEditor } from 'renderer/nodeEditor/createNodeEditor';
import { useRete } from "rete-react-plugin";
import { type MainState, convertMainToPersistedMain, createFile } from 'shared/AppType';
import { X, Plus, Circle } from 'lucide-react';
import { getNewActiveFileId } from "renderer/utils/tabs";
import useMainStore from 'renderer/hooks/MainStore';
const { App } = window

export function MainScreen() {
  const [ref, editorApi] = useRete(createNodeEditor);
  // 設定画面を表示するか
  const [showSettings, setShowSettings] = useState(false);

  // store から値とアクションを取得
  const files = useMainStore(s => s.files);
  const activeFileId = useMainStore(s => s.activeFileId);
  const addFile = useMainStore(s => s.addFile);
  const removeFile = useMainStore(s => s.removeFile);
  const setActiveFileId = useMainStore(s => s.setActiveFileId);
  const setGraphAndHistory = useMainStore(s => s.setGraphAndHistory);
  const getGraphAndHistory = useMainStore(s => s.getGraphAndHistory);
  const setAppState = useMainStore(s => s.setMainState);


  // 現在の編集状態を保存する共通関数
  const saveCurrentEditorState = () => {
    const currId = useMainStore.getState().activeFileId;
    if (editorApi && currId) {
      setGraphAndHistory(currId, editorApi.getCurrentEditorState());
    }
  };

  const handleNewFile = () => {
    // 新規作成前に、現在の編集状態を保存
    saveCurrentEditorState();
    setActiveFileId(null);

    const id = crypto.randomUUID();
    const title = `Untitled-${files.length + 1}`;
    const file = createFile(id, title);
    addFile(file);
    setActiveFileId(id);
  };

  // タブ選択
  const handleSelect = (id: string) => {
    // 選択前のファイルの編集状態を保存
    saveCurrentEditorState();
    // タブ選択
    setActiveFileId(id);
  };

  // ファイルID が変わったら保存済み state を復元
  useEffect(() => {
    if (!editorApi || !activeFileId) return;
    (async () => {
      const state = getGraphAndHistory(activeFileId);
      if (state) await editorApi.resetEditorState(state);
    })();
  }, [editorApi, activeFileId]);

  // ファイルを閉じる
  const handleCloseFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // 閉じる前に、現在の編集状態を保存
    saveCurrentEditorState();
    // タブ削除 & 新規アクティブ決定
    const nextActive = getNewActiveFileId(files, id, activeFileId);
    removeFile(id);
    setActiveFileId(nextActive);
  };

  useEffect(() => {

    App.onOpenSettings(() => {
      setShowSettings(true)
    });

    App.loadAppState().then((res: MainState) => {
      console.log("loadAppState", res);
      setAppState(res);
    });

    const unsubscribe = useMainStore.subscribe(
      // selector: storeからPersisted 可能な形に絞り込む
      (s) => ({
        version: s.version,
        files: s.files,
        settings: { ui: s.settings.ui },
        activeFileId: s.activeFileId,
      }),
      // listener: 絞り込んだstateを受け取る
      (appState) => {
        App.saveAppState(convertMainToPersistedMain(appState));
      }
    );
    return unsubscribe;

  }, [])

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
        <>
          {/* tabs */}
          <div className="flex border-b bg-gray-200">
            <div className="flex flex-nowrap overflow-hidden">
              {files.map(file => (
                // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                <div
                  key={file.id}
                  onClick={() => handleSelect(file.id)}
                  className={`flex min-w-0 items-center pl-3 pr-2 py-2 cursor-pointer ${activeFileId === file.id
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
        style={{ display: files.length === 0 ? 'none' : 'block' }}
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
