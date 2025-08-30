import type { ReactElement } from 'react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { Group } from './Group'

// Group を購読してタイトル等を描画する React コンポーネント
export function GroupView({ group }: { group: Group }): ReactElement {
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

  return (
    <div
      style={{
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      }}
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
