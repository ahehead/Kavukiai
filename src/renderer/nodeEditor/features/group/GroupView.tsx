import { MoreVertical } from 'lucide-react'
import type { ReactElement, MouseEvent as ReactMouseEvent } from 'react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { ChromePicker, type ColorResult } from 'react-color'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'renderer/components/ui/popover'
import { cn } from 'renderer/lib/utils'
import type {
  Group,
  GroupStyleChangeOptions,
  GroupStylePatch,
  GroupStyleSnapshot,
} from './Group'

type RgbaLike = { r: number; g: number; b: number; a?: number }
type PickerTarget = 'background' | 'text' | null

const HEX8_REGEX = /^#[0-9a-f]{8}$/i
const DEFAULT_BG_HEX = '#e5e7ebff'
const DEFAULT_FONT_HEX = '#1f2937ff'

function ensureHex8(value: string | undefined, fallback: string): string {
  return HEX8_REGEX.test(value ?? '') ? (value as string).toLowerCase() : fallback
}

function hexToRgba(hex: string): RgbaLike {
  const value = hex.slice(1)
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  const a = parseInt(value.slice(6, 8), 16) / 255
  return {
    r,
    g,
    b,
    a: Number.isNaN(a) ? 1 : clampAlpha(a),
  }
}

function rgbaToHex({ r, g, b, a }: RgbaLike): string {
  const toHex = (value: number) => clampByte(Math.round(value)).toString(16).padStart(2, '0')
  const alpha = clampByte(Math.round(clampAlpha(a ?? 1) * 255))
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${alpha.toString(16).padStart(2, '0')}`.toLowerCase()
}

function clampByte(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.min(255, Math.max(0, value))
}

function clampAlpha(value: number): number {
  if (Number.isNaN(value)) return 1
  return Math.min(1, Math.max(0, value))
}

type Props = {
  group: Group
  getK?: () => number
  translate?: (id: string, dx: number, dy: number) => Promise<void>
  emitContextMenu?: (e: MouseEvent, group: Group) => void
  emitGroupPointerDown?: (event: PointerEvent, group: Group) => void
  emitGroupDoubleClick?: (event: MouseEvent, group: Group) => void
  onTextChange?: (group: Group) => void
  onStyleChange?: (
    group: Group,
    patch: GroupStylePatch | undefined,
    options?: GroupStyleChangeOptions
  ) => void
}

// Group を購読してタイトル等を描画する React コンポーネント
export function GroupView({
  group,
  getK,
  translate,
  emitContextMenu,
  emitGroupPointerDown,
  emitGroupDoubleClick,
  onTextChange,
  onStyleChange,
}: Props): ReactElement {
  // 外部ストアのスナップショットとして text を利用
  const text = useSyncExternalStore(
    group.subscribe,
    () => group.text,
    () => group.text
  )

  const rect = useSyncExternalStore(group.subscribe, () => group.rect)

  const bgColor = useSyncExternalStore(
    group.subscribe,
    () => group.bgColor,
    () => group.bgColor
  )
  const fontColor = useSyncExternalStore(
    group.subscribe,
    () => group.fontColor,
    () => group.fontColor
  )
  const selected = useSyncExternalStore(
    group.subscribe,
    () => group.selected,
    () => group.selected
  )

  // インライン編集用のローカル状態
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(text)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const lastX = useRef(0)
  const lastY = useRef(0)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [activePicker, setActivePicker] = useState<PickerTarget>(null)
  const pendingHistoryRef = useRef<GroupStyleSnapshot | null>(null)

  const draftLineCount = useMemo(
    () => Math.max(1, draft.split(/\r?\n/).length),
    [draft]
  )
  const backgroundHex = useMemo(
    () => ensureHex8(bgColor, DEFAULT_BG_HEX),
    [bgColor]
  )
  const textHex = useMemo(
    () => ensureHex8(fontColor, DEFAULT_FONT_HEX),
    [fontColor]
  )
  const backgroundPickerColor = useMemo(() => hexToRgba(backgroundHex), [backgroundHex])
  const textPickerColor = useMemo(() => hexToRgba(textHex), [textHex])

  const stopPointerPropagation = useCallback((event: React.PointerEvent) => {
    event.stopPropagation()
  }, [])

  const togglePicker = useCallback((target: PickerTarget) => {
    setActivePicker(prev => (prev === target ? null : target))
  }, [])

  // 編集開始時にフォーカス
  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  // 編集開始時/テキスト変更時に高さを自動調整
  useEffect(() => {
    if (!editing) return
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [editing, draft])

  useEffect(() => {
    onTextChange?.(group)
  }, [group, onTextChange, text])

  useEffect(() => {
    if (!editing) setDraft(text)
  }, [text, editing])

  useEffect(() => {
    if (!popoverOpen) {
      setActivePicker(null)
      if (pendingHistoryRef.current && onStyleChange) {
        const prev = pendingHistoryRef.current
        pendingHistoryRef.current = null
        onStyleChange(group, undefined, {
          recordHistory: true,
          prevSnapshot: prev,
        })
      }
    }
  }, [popoverOpen, group, onStyleChange])

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

  const onKeyDownTextarea = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    stopPropagationKeys(e)
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
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
    emitGroupPointerDown?.(e.nativeEvent, group)
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

  const ensureHistorySnapshot = useCallback(() => {
    if (!pendingHistoryRef.current) {
      pendingHistoryRef.current = group.getStyleSnapshot()
    }
  }, [group])

  const applyStylePatch = useCallback(
    (patch: GroupStylePatch, commitChange: boolean) => {
      if (!onStyleChange) return
      if (!commitChange) {
        ensureHistorySnapshot()
        onStyleChange(group, patch, { recordHistory: false })
        return
      }
      const prev = pendingHistoryRef.current ?? group.getStyleSnapshot()
      pendingHistoryRef.current = null
      onStyleChange(group, patch, {
        recordHistory: true,
        prevSnapshot: prev,
      })
    },
    [ensureHistorySnapshot, group, onStyleChange]
  )

  const handleBackgroundChange = useCallback(
    (color: ColorResult, commitChange: boolean) => {
      const hex = rgbaToHex(color.rgb)
      applyStylePatch({ bgColor: hex }, commitChange)
    },
    [applyStylePatch]
  )

  const handleTextColorChange = useCallback(
    (color: ColorResult, commitChange: boolean) => {
      const hex = rgbaToHex(color.rgb)
      applyStylePatch({ fontColor: hex }, commitChange)
    },
    [applyStylePatch]
  )

  const resetBackground = useCallback(() => {
    if (!onStyleChange) return
    pendingHistoryRef.current = null
    onStyleChange(
      group,
      { bgColor: null },
      {
        recordHistory: true,
        prevSnapshot: group.getStyleSnapshot(),
      }
    )
  }, [group, onStyleChange])

  const resetTextColor = useCallback(() => {
    if (!onStyleChange) return
    pendingHistoryRef.current = null
    onStyleChange(
      group,
      { fontColor: null },
      {
        recordHistory: true,
        prevSnapshot: group.getStyleSnapshot(),
      }
    )
  }, [group, onStyleChange])

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drag and context menu handled manually
    <div
      style={{
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        ...(bgColor ? { backgroundColor: bgColor } : {}),
        ...(fontColor ? { color: fontColor } : {}),
      }}
      onPointerDown={onPointerDownRoot}
      onPointerMove={onPointerMoveRoot}
      onContextMenu={onContextMenuRoot}
      onDoubleClick={(event: ReactMouseEvent<HTMLDivElement>) => {
        event.stopPropagation()
        event.preventDefault()
        if (editing) return
        if (emitGroupDoubleClick) {
          emitGroupDoubleClick(event.nativeEvent, group)
        }
      }}
      data-selected={selected ? 'true' : undefined}
      className={cn(
        'w-full h-full rounded-md border border-neutral-500/60 dark:border-neutral-600/60 bg-neutral-200/50 dark:bg-neutral-800/40 p-2',
        selected &&
        'border-blue-500/70 dark:border-blue-400/70 ring-2 ring-blue-400/40 dark:ring-blue-500/30'
      )}
    >
      {/* タイトル行。クリックで編集モードに */}
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            'flex-1 text-sm font-medium',
            fontColor
              ? 'text-[inherit]'
              : 'text-neutral-900 dark:text-neutral-100'
          )}
        >
          {editing ? (
            <textarea
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={onKeyDownTextarea}
              // ポインタイベントの親伝播を止めてドラッグを防止
              onPointerDown={e => {
                e.stopPropagation()
                if (e.nativeEvent?.stopImmediatePropagation)
                  e.nativeEvent.stopImmediatePropagation()
              }}
              aria-label="グループ名を編集"
              rows={draftLineCount}
              style={fontColor ? { color: fontColor } : undefined}
              className="w-full bg-transparent outline-none border border-neutral-400/60 dark:border-neutral-500/60 rounded px-2 py-1 focus:border-blue-500/70 resize-none"
            />
          ) : (
            <button
              type="button"
              title="クリックして名前を編集"
              className="inline-flex min-h-7 items-start rounded px-1 hover:bg-neutral-900/5 dark:hover:bg-neutral-50/5 cursor-text select-text whitespace-pre-wrap text-left bg-transparent w-full"
              style={fontColor ? { color: fontColor } : undefined}
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
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="グループのスタイルを編集"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-transparent bg-neutral-200/50 text-neutral-700 transition hover:bg-neutral-900/10 dark:bg-neutral-50/10 dark:text-neutral-200 dark:hover:bg-neutral-50/15"
              onPointerDown={e => {
                e.stopPropagation()
              }}
              onClick={e => {
                e.stopPropagation()
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-72 space-y-4"
            onPointerDownCapture={stopPointerPropagation}
          >
            <section className="space-y-2">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-md border border-neutral-300/80 bg-white/90 px-3 py-2 text-left text-sm font-medium shadow-sm transition hover:border-neutral-400 dark:border-neutral-700/80 dark:bg-neutral-900/70 dark:hover:border-neutral-500"
                onPointerDownCapture={stopPointerPropagation}
                onClick={() => togglePicker('background')}
              >
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Background
                  </span>
                  <span className="font-mono text-xs text-neutral-700 dark:text-neutral-200">
                    {bgColor ?? 'default'}
                  </span>
                </div>
                <span
                  aria-hidden="true"
                  className="h-6 w-6 rounded border border-black/10 shadow-sm"
                  style={{ backgroundColor: backgroundHex }}
                />
              </button>
              {activePicker === 'background' ? (
                <div
                  className="space-y-2 rounded-md border border-neutral-200 p-2 dark:border-neutral-700"
                  onPointerDownCapture={stopPointerPropagation}
                >
                  <ChromePicker
                    color={backgroundPickerColor}
                    disableAlpha={false}
                    onChange={color => handleBackgroundChange(color, false)}
                    onChangeComplete={color => handleBackgroundChange(color, true)}
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                      onPointerDownCapture={stopPointerPropagation}
                      onClick={resetBackground}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
            <section className="space-y-2">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-md border border-neutral-300/80 bg-white/90 px-3 py-2 text-left text-sm font-medium shadow-sm transition hover:border-neutral-400 dark:border-neutral-700/80 dark:bg-neutral-900/70 dark:hover:border-neutral-500"
                onPointerDownCapture={stopPointerPropagation}
                onClick={() => togglePicker('text')}
              >
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Text
                  </span>
                  <span className="font-mono text-xs text-neutral-700 dark:text-neutral-200">
                    {fontColor ?? 'default'}
                  </span>
                </div>
                <span
                  aria-hidden="true"
                  className="h-6 w-6 rounded border border-black/10 shadow-sm"
                  style={{ backgroundColor: textHex }}
                />
              </button>
              {activePicker === 'text' ? (
                <div
                  className="space-y-2 rounded-md border border-neutral-200 p-2 dark:border-neutral-700"
                  onPointerDownCapture={stopPointerPropagation}
                >
                  <ChromePicker
                    color={textPickerColor}
                    disableAlpha={false}
                    onChange={color => handleTextColorChange(color, false)}
                    onChangeComplete={color => handleTextColorChange(color, true)}
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                      onPointerDownCapture={stopPointerPropagation}
                      onClick={resetTextColor}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
