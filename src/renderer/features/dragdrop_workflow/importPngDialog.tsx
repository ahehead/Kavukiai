import { FileInput, FilePlus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from 'renderer/components/ui/dialog'

interface ImportPngDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportAsNew: () => void
  onImportToCurrent: () => void
  activeFileId: string | null
}

export function ImportPngDialog({
  open,
  onOpenChange,
  onImportAsNew,
  onImportToCurrent,
  activeFileId
}: ImportPngDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Workflowデータの読み込み方法を選択してください</DialogTitle>
        <DialogDescription></DialogDescription>
        <div className="mt-6 flex flex-col space-y-4">
          <div className="flex flex-col gap-1">
            <button
              className="flex items-center gap-2 px-4 py-3 bg-primary text-white shadow hover:bg-primary/80 transition rounded-md"
              onClick={onImportAsNew}
              aria-label="新しいファイルとして読み込む"
            >
              <FilePlus size={20} />
              <span className="font-semibold">新しいファイルとして読み込む</span>
            </button>
            <span className="text-xs text-gray-500 ml-1 text-center">
              新規ファイルとして開きます。
            </span>
          </div>
          {activeFileId && (
            <div className="flex flex-col gap-1">
              <button
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-800 rounded-md shadow hover:bg-gray-200 transition"
                onClick={onImportToCurrent}
                aria-label="現在のファイルに追加"
              >
                <FileInput size={20} />
                <span className="font-semibold">現在のファイルに追加</span>
              </button>
              <span className="text-xs text-gray-500 ml-1 text-center">
                現在の作業内容にWorkflowデータを追加します。
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
