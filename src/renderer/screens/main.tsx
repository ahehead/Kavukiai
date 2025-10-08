import { useCallback, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { ImportPngDialog } from 'renderer/features/dragdrop_workflow/importPngDialog'
import { useDragDrop } from 'renderer/features/dragdrop_workflow/useDragDrop'
import { usePngImportWorkflow } from 'renderer/features/dragdrop_workflow/usePngImportWorkflow'
import { useFileOperations } from 'renderer/features/file/useFileOperations'
import useMainStore from 'renderer/features/main-store/MainStore'
import useNodeEditorSetup from 'renderer/features/nodeEditor_setup/useNodeEditorSetup'
import { exportPngWithData } from 'renderer/features/png/exportPng'
import { importWorkflowFromPngUrl } from 'renderer/features/png/importPng'
import { electronApiService } from 'renderer/features/services/appService'
import TabBar from 'renderer/features/tab/TabBar'
import { getTemplateById } from 'renderer/features/templatesSidebar/data/templates'
import TemplateSheet from 'renderer/features/templatesSidebar/TemplateSheet'
import { TitleBar } from 'renderer/features/titlebar/TitleBar'
import { useUiStore } from 'renderer/features/ui/uiStore'
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
  const {
    ref,
    setCurrentFileState,
    resetEditorStateFromGraph,
    clearHistoryState,
    pasteWorkflowAtPosition,
  } = useNodeEditorSetup(activeFileId, getGraphAndHistory, setGraphAndHistory)

  const {
    saveFile,
    saveFileAs,
    closeFile,
    loadFile,
    newFile,
    createAndAddFile,
  } = useFileOperations(
    files,
    activeFileId,
    setCurrentFileState,
    resetEditorStateFromGraph,
    clearHistoryState,
    getFileById,
    setActiveFileId,
    addFile,
    removeFile,
    updateFile,
    clearHistory
  )

  // mainからのファイル読み込み通知を受け取り、ファイルを開く
  useEffect(() => {
    const unsub = electronApiService.onFileLoadedRequest(
      async (_e, fileData) => await loadFile(fileData)
    )
    return () => {
      unsub()
    }
  }, [loadFile])

  const nav = useNavigate()
  const openTemplates = useUiStore(s => s.openTemplates)
  const closeTemplates = useUiStore(s => s.closeTemplates)

  useEffect(() => {
    // 設定画面オープン指示
    const unsubOpen = electronApiService.onOpenSettings(() => nav('/settings'))
    return () => {
      unsubOpen()
    }
  }, [nav])

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

  useEffect(() => {
    // mainからの「ファイルを閉じる」指示（Ctrl/Cmd+W）
    const unsubClose = electronApiService.onCloseFileInitiate(async () => {
      if (activeFileId) await closeFile(activeFileId)
    })
    return () => {
      unsubClose()
    }
  }, [activeFileId, closeFile])

  // 画面をPNGで保存
  const handleSaveAsPng = useCallback(async () => {
    setCurrentFileState()
    await exportPngWithData(ref, activeFileId, getFileById)
  }, [ref, activeFileId, getFileById])

  const handleNewFile = async () => await newFile()

  // 新規作成（テンプレートから）
  const handleCreateFromTemplate = useCallback(
    async (templateId: string) => {
      const t = getTemplateById(templateId)
      if (!t) return
      if (t.type !== 'PNGWorkflow') return
      // Import PNG from URL and create new file
      const data = await importWorkflowFromPngUrl(
        t.src,
        `${t.title || t.id}.png`
      )
      if (!data) return
      const { fileName, workflow } = data
      setCurrentFileState()
      await createAndAddFile(fileName, workflow)
      // Close sheet
      closeTemplates()
    },
    [createAndAddFile, closeTemplates, setCurrentFileState]
  )

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

  // ドラッグ＆ドロップ用カスタムフック
  const {
    importDialogOpen,
    setImportDialogOpen,
    dropInfo,
    setDropInfo,
    handleDragOver,
    handleDrop,
  } = useDragDrop(pasteWorkflowAtPosition)

  const { handleImportAsNew, handleImportToCurrent } = usePngImportWorkflow({
    dropInfo,
    setDropInfo,
    setImportDialogOpen,
    addFile,
    pasteWorkflowAtPosition,
    setCurrentFileState,
  })

  return (
    <div className="flex flex-col fixed inset-0">
      {/* タイトルバー メニューバー*/}
      <TitleBar
        onSave={async () => {
          await saveFile(activeFileId)
        }}
        onSaveAs={async () => {
          await saveFileAs(activeFileId)
        }}
        onOpen={async () => {
          await handleLoadFile()
        }}
        onExportPng={async () => {
          await handleSaveAsPng()
        }}
      />
      {/* メインコンテンツ */}
      <main className="flex flex-1 flex-col">
        {/* ファイルがない場合の画面 */}
        {files.length === 0 ? (
          // biome-ignore lint/a11y/noStaticElementInteractions: false positive
          <div className="flex-1 flex items-center justify-center bg-blue-100 border-8 rounded-lg border-white"
            onDragOver={handleDragOver}
            onDrop={handleDrop}>
            <div className="flex flex-col items-start dialog-animate-up">
              <ul className="">
                <li className="mb-2  rounded hover:bg-gray-100 bg-background">
                  <button className="px-4 py-2" onClick={handleNewFile}>
                    ・ 新規作成
                  </button>
                </li>
                <li className="mb-2 bg-background rounded hover:bg-gray-100">
                  <button className="px-4 py-2" onClick={openTemplates}>
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
          {/** biome-ignore lint/a11y/noStaticElementInteractions: false positive */}
          <div
            ref={ref}
            className="w-full h-full"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        </div>
        <Outlet />

        {/* Templates Sheet */}
        <TemplateSheet onCreateFromTemplate={handleCreateFromTemplate} />

        {/* トースター通知 */}
        <Toaster richColors={true} expand={true} offset={5} />
      </main>
      {/* dialog */}
      <ImportPngDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportAsNew={handleImportAsNew}
        onImportToCurrent={handleImportToCurrent}
        activeFileId={activeFileId}
      />
    </div>
  )
}
