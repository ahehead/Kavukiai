import { useEffect, useState } from 'react'
import SettingsModal from 'renderer/components/SettingsModal';
import { createNodeEditor } from 'renderer/nodeEditor/createNodeEditor';
import { useRete } from "rete-react-plugin";
import { createAppState, createFile, type AppState } from 'shared/AppType';
import { X, Plus, Circle } from 'lucide-react';
const { App } = window

export function MainScreen() {
  const [ref, editor] = useRete(createNodeEditor);
  const [showSettings, setShowSettings] = useState(false);

  const [appState, setAppState] = useState<AppState>(createAppState());

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
  };

  // タブ選択
  const handleSelect = (id: string) => {
    setAppState(prev => ({ ...prev, activeFileId: id }));
  };

  // ファイルを閉じる（左隣タブを選択）
  const handleCloseFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
      {appState.files.length === 0
        ? (
          <div className="flex-1 flex items-center justify-center bg-blue-50">
            <button
              className="px-4 py-2 bg-white  rounded"
              onClick={handleNewFile}
            >
              新規作成
            </button>
          </div>
        )
        : (
          <>
            {/* tabs */}
            <div className="flex border-b bg-gray-100">
              <div className=' flex flex-nowrap  overflow-hidden'>
                {appState.files.map(file => (
                  // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                  <div
                    key={file.id}
                    onClick={() => handleSelect(file.id)}
                    className={`flex min-w-0 items-center pl-3 pr-2  py-2 cursor-pointer bg-white ${appState.activeFileId === file.id ? 'border-t-2 border-t-red-300 border-l border-r-2 border-b-[1px] border-b-white -mb-[1px]' : 'border-r'
                      }`}
                  >
                    {/* file name */}
                    <span className='flex-shrink min-w-0 truncate whitespace-nowrap mr-1'>{file.title}</span>
                    {/* close button */}
                    {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                    <span
                      onClick={e => handleCloseFile(file.id, e)}
                      className='flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-300 rounded-md'
                    >
                      {
                        file.isDirty ?
                          <span className=" text-gray-600" >
                            <Circle className='w-3 h-3' fill='#4a5565' />
                          </span> :
                          <span className='text-gray-600' ><X className='w-4 h-4' /></span>
                      }
                    </span>
                  </div>
                ))}
              </div>
              {/* new file button */}
              <div className='flex flex-1 items-center pl-2 flex-shrink-0'>
                <button
                  onClick={handleNewFile}
                  className="w-5 h-5 flex items-center justify-center  hover:bg-gray-300 rounded-md"
                >
                  <Plus className='w-4 h-4' />
                </button>
              </div>
            </div>
            {/* editor */}
            <div className="App flex-1 w-full h-full">
              <div ref={ref} className='w-full h-full' />
            </div>
          </>
        )
      }
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </main>
  )
}
