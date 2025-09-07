import { XIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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
  // const anchors = useMemo(() => Object.keys(byGenre), [byGenre])
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
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <h2 className="text-sm font-semibold">Templates</h2>
          <button
            aria-label="Close"
            title="Close"
            className="rounded-md p-1 opacity-70 hover:opacity-100 hover:bg-neutral-300 transition-opacity focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background"
            onClick={handleClose}
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* Genre anchors */}
        {/* <div className="flex gap-2 overflow-auto px-3 py-2 border-b">
          {anchors.length > 0 ? (
            anchors.map(g => (
              <a
                key={g}
                href={`#genre-${encodeURIComponent(g)}`}
                className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80"
              >
                {g}
              </a>
            ))
          ) : (
            <div className="text-xs text-muted-foreground">
              No templates yet
            </div>
          )}
        </div> */}

        {/* Content */}
        <div className="h-[calc(100%-88px)] overflow-auto p-3 space-y-6">
          {Object.entries(byGenre).map(([genre, items]) => (
            <section key={genre} id={`genre-${genre}`} className="space-y-2">
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
          ))}
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
  const isPng = t.type === 'PNGWorkflow' && /\.png($|\?)/i.test(t.src)

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData(
      'application/x-workflow-template',
      JSON.stringify({ id: t.id })
    )
    e.dataTransfer.effectAllowed = 'copy'
    // Optional: use thumb as drag image
    const img =
      (e.currentTarget.querySelector('img') as HTMLImageElement) || null
    if (img)
      e.dataTransfer.setDragImage(
        img,
        Math.floor(img.width / 2),
        Math.floor(img.height / 2)
      )
    onDragStart?.()
  }
  const handleDragEnd = () => {
    onDragEnd?.()
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop card needs div with event handlers
    <div
      className="rounded border w-full bg-card hover:shadow-lg transition p-2 space-y-2"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      title={t.title}
    >
      <div className="aspect-video overflow-hidden rounded border bg-muted flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={t.src}
          alt={t.title}
          className="object-cover w-full h-full"
          loading="lazy"
        />
      </div>
      <div className="space-y-1">
        <div className="text-sm font-medium leading-tight">{t.title}</div>
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {t.type}
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
      <div className="pt-1">
        <button
          className={cn(
            'w-full text-xs px-2 py-1 rounded border',
            isPng ? 'hover:bg-accent/60' : 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => isPng && onCreate?.()}
          disabled={!isPng}
        >
          新規作成
        </button>
      </div>
    </div>
  )
}

export default TemplateSheet
