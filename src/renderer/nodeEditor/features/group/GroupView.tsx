import type { ReactElement } from 'react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { Group } from './Group'

type Props = {
  group: Group
  getK?: () => number
  translate?: (id: string, dx: number, dy: number) => Promise<void>
  emitContextMenu?: (e: MouseEvent, group: Group) => void
}

// Group を購読してタイトル等を描画する React コンポーネント
export function GroupView({ group, getK, translate, emitContextMenu }: Props): ReactElement {
  // 外部ストアのスナップショットとして text を利用
  const text = useSyncExternalStore(
    group.subscribe,
    () => group.text,
    () => group.text
  )

  const rect = useSyncExternalStore(
    group.subscribe,
    () => group.rect,
  )

  // インライン編集用のローカル状態
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(text)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const lastX = useRef(0)
  const lastY = useRef(0)

  // 編集開始時にフォーカス
  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const startEdit = (e: React.PointerEvent) => {
    // グループのドラッグ開始を抑止
    e.stopPropagation()
    e.preventDefault()
    setDraft(text)
    setEditing(true)
  }

  const stopPropagationKeys = (e: React.KeyboardEvent) => {
    // エディタのショートカット等に伝播させない
    e.stopPropagation()
  }

  const commit = () => {
    const next = draft
    if (next !== group.text) {
      group.text = next // setter 経由で購読者に通知
    }
    setEditing(false)
  }

  const cancel = () => {
    setDraft(text)
    setEditing(false)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    stopPropagationKeys(e)
    if (e.key === 'Enter') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancel()
    }
  }

  const onPointerDownRoot = (e: React.PointerEvent<HTMLDivElement>) => {
    // 左ボタン以外は無視
    if (e.button !== 0) return
    // 編集中はドラッグ開始も無効化し、編集モードを終了、確定
    if (editing) {
      commit()
      return
    }
    e.stopPropagation()
    lastX.current = e.clientX
    lastY.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMoveRoot = async (e: React.PointerEvent<HTMLDivElement>) => {
    // 編集中はドラッグ処理を無効化
    if (editing) return
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    e.stopPropagation()
    if (!(e.buttons & 1)) return
    const k = getK ? getK() : 1
    const dx = (e.clientX - lastX.current) / k
    const dy = (e.clientY - lastY.current) / k
    lastX.current = e.clientX
    lastY.current = e.clientY
    if (translate) await translate(group.id, dx, dy)
  }

  const onContextMenuRoot = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (emitContextMenu) emitContextMenu(e.nativeEvent, group)
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drag and context menu handled manually
    <div
      style={{
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      }}
      onPointerDown={onPointerDownRoot}
      onPointerMove={onPointerMoveRoot}
      onContextMenu={onContextMenuRoot}
      className="w-full h-full rounded-md border border-neutral-500/60 dark:border-neutral-600/60 bg-neutral-200/50 dark:bg-neutral-800/40 p-2">
      {/* タイトル行。クリックで編集モードに */}
      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={onKeyDown}
            // ポインタイベントの親伝播を止めてドラッグを防止
            onPointerDown={e => {
              e.stopPropagation()
              if (e.nativeEvent?.stopImmediatePropagation) e.nativeEvent.stopImmediatePropagation()
            }}
            aria-label="グループ名を編集"
            className="w-full bg-transparent outline-none border border-neutral-400/60 dark:border-neutral-500/60 rounded px-2 py-1 focus:border-blue-500/70"
          />
        ) : (
          <button
            type="button"
            title="クリックして名前を編集"
            className="inline-flex min-h-7 items-center rounded px-1 hover:bg-neutral-900/5 dark:hover:bg-neutral-50/5 cursor-text select-none bg-transparent"
            onPointerDown={startEdit}
            onClick={e => {
              // onPointerDownで編集開始済み。クリックは無効化してバブル抑止のみ。
              e.stopPropagation()
              e.preventDefault()
            }}
          >
            {text || 'Untitled'}
          </button>
        )}
      </div>
    </div>
  )
}
