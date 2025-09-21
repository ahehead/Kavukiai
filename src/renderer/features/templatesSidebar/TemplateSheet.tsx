import { Editor } from '@monaco-editor/react'
import { XIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { importWorkflowFromPngUrl } from 'renderer/features/png/importPng'
import { notify } from 'renderer/features/toast-notice/notify'
import { useUiStore } from 'renderer/features/ui/uiStore'
import { cn } from 'renderer/lib/utils'
import { groupByGenre, TEMPLATES } from './data/templates'
import type { TemplateMeta } from './data/types'

type TemplateSheetProps = {
  // If provided, overrides query param. Otherwise query param controls visibility.
  open?: boolean
  // Called when user clicks "新規作成" for a PNG template
  onCreateFromTemplate?: (templateId: string) => Promise<void> | void
}

export function TemplateSheet({
  open,
  onCreateFromTemplate,
}: TemplateSheetProps) {
  const templatesOpen = useUiStore(s => s.templatesOpen)
  const closeTemplates = useUiStore(s => s.closeTemplates)
  const isOpen = open ?? templatesOpen

  const handleClose = () => {
    closeTemplates()
  }

  // Close with Esc
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  const byGenre = useMemo(() => groupByGenre(TEMPLATES), [])
  const anchors = useMemo(() => Object.keys(byGenre), [byGenre])
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  return (
    <>
      {/* Overlay */}
      {/** biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop overlay needs div with event handlers */}
      {/** biome-ignore lint/a11y/useKeyWithClickEvents: drag-and-drop overlay needs div with event handlers */}
      <div
        ref={overlayRef}
        className={cn(
          'fixed inset-0 z-30 bg-black/20 transition-opacity',
          isOpen
            ? cn(
              'opacity-100',
              isDragging ? 'pointer-events-none' : 'pointer-events-auto'
            )
            : 'opacity-0 pointer-events-none'
        )}
        onClick={handleClose}
      />
      {/* Sheet */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-[420px] max-w-[90vw] shadow-xl border-r bg-background',
          'transition-transform will-change-transform',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Templates"
        onDragEnd={() => setIsDragging(false)}
      >
        <div className="flex items-center justify-between px-3 py-2 bg-node-header gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold whitespace-nowrap">Templates (ドラッグ＆ドロップ可能)</h2>
          </div>
          <button
            aria-label="Close"
            title="Close"
            className="rounded-md p-1 opacity-70 hover:opacity-100 hover:bg-neutral-300 transition-opacity focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background"
            onClick={handleClose}
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* Genre anchors  */}
        <div className="flex gap-2 overflow-auto px-3 pt-2 pb-2">
          {anchors.length > 0 ? (
            anchors.map(g => {
              const sectionId = `genre-${encodeURIComponent(g)}`
              return (
                <button
                  key={g}
                  type="button"
                  className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 action:ring-2 action:ring-ring"
                  onClick={() => {
                    const el = document.getElementById(sectionId)
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                >
                  {g}
                </button>
              )
            })
          ) : (
            <div className="text-xs text-muted-foreground">No templates yet</div>
          )}
        </div>

        {/* Content */}
        <div className="h-[calc(100%-88px)] overflow-auto pt-1.5 px-3 space-y-6">
          {Object.entries(byGenre).map(([genre, items]) => {
            const sectionId = `genre-${encodeURIComponent(genre)}`
            return (
              <section key={genre} id={sectionId} className="space-y-2">
                <div className="text-sm font-semibold">{genre}</div>
                <div className="grid grid-cols-1 gap-3">
                  {items.map(t => (
                    <TemplateCard
                      key={t.id}
                      t={t}
                      onCreate={() => onCreateFromTemplate?.(t.id)}
                      onDragStart={() => setIsDragging(true)}
                      onDragEnd={() => setIsDragging(false)}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </aside>
    </>
  )
}

function TemplateCard({
  t,
  onCreate,
  onDragStart,
  onDragEnd,
}: {
  t: TemplateMeta
  onCreate?: () => void
  onDragStart?: () => void
  onDragEnd?: () => void
}) {
  const isPrompt = t.type === 'Prompt'
  const isPng = !isPrompt && t.type === 'PNGWorkflow' && /\.png($|\?)/i.test(t.src)
  const [isCopying, setIsCopying] = useState(false)
  // Prompt カード内でのみ使用するローカル言語トグル
  const [promptLang, setPromptLang] = useState<'ja' | 'en'>('ja')
  // ボタン上でのドラッグ開始防止用フラグ
  const dragAllowedRef = useRef(false)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null
    dragAllowedRef.current = !target?.closest('button')
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // 直前の mousedown でボタン上だった場合はキャンセル
    if (!dragAllowedRef.current) {
      e.preventDefault()
      return
    }
    e.dataTransfer.setData(
      'application/x-workflow-template',
      JSON.stringify({ id: t.id })
    )
    e.dataTransfer.effectAllowed = 'copy'
    // Optional: use thumb as drag image
    const img =
      (e.currentTarget.querySelector('img') as HTMLImageElement) || null
    if (img) e.dataTransfer.setDragImage(img, 0, 0)
    onDragStart?.()
  }
  const handleDragEnd = () => {
    onDragEnd?.()
  }

  const promptText = isPrompt
    ? // Fallback: 無い場合は他言語を使う
    t.prompt[promptLang] || t.prompt[promptLang === 'ja' ? 'en' : 'ja']
    : ''

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop card needs div with event handlers
    <div
      className="rounded border w-full bg-card hover:shadow-lg transition p-2 space-y-2"
      draggable={!isPrompt}
      onMouseDown={handleMouseDown}
      onDragStart={isPrompt ? undefined : handleDragStart}
      onDragEnd={isPrompt ? undefined : handleDragEnd}
      title={t.title}
    >
      {/* プレビュー */}
      <div className="flex flex-col w-full relative">
        {isPrompt ? (
          <>
            {/* ローカル言語切り替え */}
            <div className="flex items-center gap-1 pt-1">
              {(['ja', 'en'] as const).map(lang => (
                <button
                  key={lang}
                  type="button"
                  className={cn(
                    'text-[10px] px-2 py-0.5 border-x border-t transition',
                    promptLang === lang
                      ? 'bg-accent/30 text-foreground'
                      : 'bg-background hover:bg-muted'
                  )}
                  onClick={() => setPromptLang(lang)}
                  title={`Switch prompt language to ${lang.toUpperCase()}`}
                >
                  {lang === 'ja' ? '日本語' : 'EN'}
                </button>
              ))}
            </div>
            <div className='border'>
              <Editor
                width="100%"
                height="250px"
                value={promptText}
                language="markdown"
                theme="vs"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  lineNumbers: 'off',
                  folding: false,
                  scrollBeyondLastLine: false,
                  renderLineHighlight: 'none',
                  overviewRulerLanes: 0,
                  overviewRulerBorder: false,
                  wordWrap: 'on',
                  wrappingStrategy: 'advanced',
                  glyphMargin: false,
                  scrollbar: { vertical: 'auto', horizontal: 'hidden' },
                  padding: { top: 4, bottom: 4 },
                  hover: { enabled: false },
                  fontSize: 12,
                  automaticLayout: true,
                }}
              />
            </div>
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={t.src}
            alt={t.title}
            className="object-cover w-full h-full border"
            loading="lazy"
          />
        )}
      </div>
      <div className="space-y-1">
        {/* タイトルとタイプを横並びにし、タイトルは長い場合省略表示 */}
        <div className="flex items-center gap-2">
          <div
            className="text-sm font-medium leading-tight min-w-0 truncate"
            title={t.title}
          >
            {t.title}
          </div>
          <div className="text-[10px] rounded uppercase tracking-wide  bg-node-label shrink-0 px-1.5">
            {t.type}
          </div>
        </div>
        {t.tags && t.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {t.tags.map(tag => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {t.descriptionMd && (
          <Markdown remarkPlugins={[remarkGfm]}>{t.descriptionMd}</Markdown>
        )}
      </div>
      <div className="pt-1 flex gap-2">
        {/* Prompt タイプ: コピーのみ */}
        {isPrompt && (
          <button
            className={cn(
              'flex-1 text-xs px-2 py-1 rounded border',
              !isCopying
                ? 'hover:bg-accent/60'
                : 'opacity-50 cursor-not-allowed'
            )}
            disabled={isCopying}
            onClick={async () => {
              if (isCopying) return
              try {
                setIsCopying(true)
                await navigator.clipboard.writeText(promptText)
                notify(
                  'success',
                  `プロンプト(${promptLang.toUpperCase()})をクリップボードにコピーしました`
                )
              } catch (e: any) {
                notify('error', `コピーに失敗: ${e?.message ?? String(e)}`)
              } finally {
                setIsCopying(false)
              }
            }}
          >
            {isCopying ? 'コピー中...' : 'コピー'}
          </button>
        )}
        {/* PNGWorkflow タイプ: 既存の2ボタン (コピー + 新規作成) */}
        {!isPrompt && (
          <>
            <button
              className={cn(
                'flex-1 text-xs px-2 py-1 rounded border',
                isPng && !isCopying
                  ? 'hover:bg-accent/60'
                  : 'opacity-50 cursor-not-allowed'
              )}
              disabled={!isPng || isCopying}
              onClick={async () => {
                if (!isPng || isCopying) return
                try {
                  setIsCopying(true)
                  // t is guaranteed to have src in this branch
                  const wf = await importWorkflowFromPngUrl(t.src, `${t.id}.png`)
                  if (!wf) return
                  await navigator.clipboard.writeText(
                    JSON.stringify(wf.workflow, null, 2)
                  )
                  notify(
                    'success',
                    'ワークフローをクリップボードにコピーしました'
                  )
                } catch (e: any) {
                  notify('error', `コピーに失敗: ${e?.message ?? String(e)}`)
                } finally {
                  setIsCopying(false)
                }
              }}
            >
              {isCopying ? 'コピー中...' : 'コピー'}
            </button>
            <button
              className={cn(
                'flex-1 text-xs px-2 py-1 rounded border',
                isPng ? 'hover:bg-accent/60' : 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => isPng && onCreate?.()}
              disabled={!isPng}
            >
              新規作成
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default TemplateSheet
