import { useCallback, useEffect, useState } from 'react'
import SettingsModal from 'renderer/components/SettingsModal'
import { MenuButton } from 'renderer/components/UIButton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'renderer/components/ui/dropdown-menu'
import { electronApiService } from 'renderer/features/services/appService'
import TabBar from 'renderer/features/tab/TabBar'
import { notify } from 'renderer/features/toast-notice/notify'
import useMainStore from 'renderer/hooks/MainStore'
import { useFileOperations } from 'renderer/hooks/useFileOperations'
import useNodeEditorSetup from 'renderer/hooks/useNodeEditorSetup'
import { Toaster } from 'sonner'
import { useShallow } from 'zustand/react/shallow'

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
    clearHistory,
  } = useMainStore(
    useShallow(state => ({
      files: state.files,
      activeFileId: state.activeFileId,
      getFileById: state.getFileById,
      addFile: state.addFile,
      removeFile: state.removeFile,
      setActiveFileId: state.setActiveFileId,
      setGraphAndHistory: state.setGraphAndHistory,
      getGraphAndHistory: state.getGraphAndHistory,
      updateFile: state.updateFile,
      clearHistory: state.clearHistory,
    }))
  )

  // Reteエディタのセットアップ
  const { ref, setCurrentFileState, clearEditorHistory } = useNodeEditorSetup(
    activeFileId,
    getGraphAndHistory,
    setGraphAndHistory
  )

  const { saveFile, saveFileAs, closeFile, loadFile, newFile } =
    useFileOperations(
      files,
      activeFileId,
      setCurrentFileState,
      clearEditorHistory,
      getFileById,
      setActiveFileId,
      addFile,
      removeFile,
      updateFile,
      clearHistory
    )

  // 設定画面を表示するか
  const [showSettings, setShowSettings] = useState(false)

  // mainからのファイル読み込み通知を受け取り、ファイルを開く
  useEffect(() => {
    const unsub = electronApiService.onFileLoadedRequest(
      async (_e, fileData) => await loadFile(fileData)
    )
    return () => {
      unsub()
    }
  }, [loadFile])

  useEffect(() => {
    // 設定画面オープン指示
    const unsubOpen = electronApiService.onOpenSettings(() =>
      setShowSettings(true)
    )
    return () => {
      unsubOpen()
    }
  }, [setShowSettings])

  useEffect(() => {
    // mainからの保存指示を受け取り、現在開いているファイルを保存
    const unsubSave = electronApiService.onSaveGraphInitiate(
      async () => await saveFile(activeFileId)
    )
    return () => {
      unsubSave()
    }
  }, [activeFileId, saveFile])

  useEffect(() => {
    // mainからの「名前を付けて保存」指示
    const unsubSaveAs = electronApiService.onSaveAsGraphInitiate(
      async () => await saveFileAs(activeFileId)
    )
    return () => {
      unsubSaveAs()
    }
  }, [activeFileId, saveFileAs])

  // 画面をPNGで保存
  const handleSaveAsPng = useCallback(async () => {
    if (!ref.current || !activeFileId) return
    try {
      const file = getFileById(activeFileId)
      if (!file) return

      // capture area: bounding box of editor root
      const rect = (ref.current as HTMLElement).getBoundingClientRect()
      const graphState = getGraphAndHistory(activeFileId)
      const graph = graphState?.graph
      if (!graph) return

      const res = await electronApiService.exportPngWithData({
        initialFileName: file.title,
        graph,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      })

      if (res.status === 'error') {
        notify('error', `Failed to export PNG: ${res.message}`)
      } else if (res.status === 'success') {
        notify('success', `Saved: ${res.data.filePath}`)
      }
    } catch (err) {
      notify('error', `Failed to save image: ${(err as any).message}`)
    }
  }, [ref, activeFileId, getFileById, getGraphAndHistory])

  const handleNewFile = async () => {
    newFile()
  }

  // タブ選択
  const handleSelect = (id: string) => {
    // 選択前のファイルの状態を保存
    setCurrentFileState()
    setActiveFileId(id)
  }

  // ファイルを閉じる
  const handleCloseFile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    closeFile(id)
  }

  // ファイルを開くボタン
  const handleLoadFile = useCallback(async () => {
    const result = await electronApiService.loadFile()
    if (!result) return
    await loadFile(result)
  }, [loadFile])

  return (
    <div className="flex flex-col fixed inset-0">
      {/* タイトルバー メニューバー*/}
      <div className="flex titlebar bg-titlebar">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <MenuButton>File</MenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={async () => await saveFile(activeFileId)}
              >
                Save
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => await saveFileAs(activeFileId)}
              >
                Save As
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLoadFile}>Open</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <MenuButton onClick={() => setShowSettings(true)}>Setting</MenuButton>
        <MenuButton onClick={handleSaveAsPng}>Export as PNG</MenuButton>
      </div>
      {/* メインコンテンツ */}
      <main className="flex flex-1 flex-col">
        {files.length === 0 ? (
          <div className="flex-1 flex items-center justify-center bg-blue-100 border-8 rounded-lg border-white">
            <div className="flex flex-col items-start dialog-animate-up">
              <ul className="">
                <li className="mb-2  rounded hover:bg-gray-100 bg-background">
                  <button className="px-4 py-2" onClick={handleNewFile}>
                    ・ 新規作成
                  </button>
                </li>
                <li className="mb-2 bg-background rounded hover:bg-gray-100">
                  <button className="px-4 py-2" onClick={handleNewFile}>
                    ・ テンプレートから作成
                  </button>
                </li>
                <li className="mb-2 bg-background rounded hover:bg-gray-100">
                  <button className="px-4 py-2" onClick={handleLoadFile}>
                    ・ ファイルを開く
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
        {
          // 設定画面
          showSettings && (
            <SettingsModal onClose={() => setShowSettings(false)} />
          )
        }
        <Toaster richColors={true} expand={true} offset={5} />
      </main>
    </div>
  )
}
