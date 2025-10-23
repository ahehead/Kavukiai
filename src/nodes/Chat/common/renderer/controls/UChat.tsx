// UChatMessageListControl.tsx

import { Editor } from '@monaco-editor/react'
import {
  extractTextContent,
  type UChat,
  type UChatMessage,
  type UPart,
} from '@nodes/Chat/common/schema/UChatMessage'
import { Check, Copy, Pencil, Trash2, X } from 'lucide-react'
import type { JSX } from 'react'
import { useEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  BaseControl,
  type ControlOptions,
  useControlValue,
} from 'renderer/nodeEditor/types'
import { Drag } from 'rete-react-plugin'
import { ChatStore } from './ChatStore'
import { DeltaSession } from './DeltaSession'

export interface DeltaStreamFunctions {
  start(initial?: Partial<UChatMessage>): void
  setInfo(info: Partial<UChatMessage>): void
  pushDelta(delta: string): void
  finish(finalText?: string, message?: Partial<UChatMessage>): void
}

export interface UChatControlParams extends ControlOptions<UChat> {
  value: UChat
}

export class UChatControl extends BaseControl<UChat, UChatControlParams> {
  private readonly store: ChatStore
  private readonly session: DeltaSession

  constructor(opts: UChatControlParams) {
    super(opts)
    this.store = new ChatStore(opts.value ?? [])
    this.session = new DeltaSession(this.store)
  }

  getValue(): UChat {
    return this.store.value
  }

  setValue(v: UChat): void {
    const prev = this.store.value
    this.store.setAll(v)
    this.addHistory(prev, this.store.value)
    this.opts.onChange?.(this.store.value)
    this.notify()
  }

  addMessage(m: UChatMessage): void {
    const prev = this.store.value
    this.store.add(m)
    this.addHistory(prev, this.store.value)
    this.opts.onChange?.(this.store.value)
    this.notify()
  }

  modifyChatMessage(i: number, m: UChatMessage): void {
    const prev = this.store.value
    this.store.modifyAt(i, m)
    this.addHistory(prev, this.store.value)
    this.opts.onChange?.(this.store.value)
    this.notify()
  }

  clear(): void {
    const prev = this.store.value
    this.store.clear()
    this.addHistory(prev, this.store.value)
    this.opts.onChange?.(this.store.value)
    this.notify()
  }

  getMessagesWithSystemPrompt(text: string): UChat {
    return this.store.withSystemPrompt(text)
  }

  setupDeltaFunctions(): DeltaStreamFunctions {
    let prev: UChat = []
    return {
      start: initial => {
        prev = [...this.store.value]
        this.session.start(initial)
        this.notify()
      },
      setInfo: info => {
        this.session.setInfo(info)
        this.notify()
      },
      pushDelta: delta => {
        this.session.delta(delta)
        this.notify()
      },
      finish: (text, message) => {
        this.session.finish(text, message)
        const next = this.store.value
        this.addHistory(prev, next)
        this.opts.onChange?.(next)
        this.notify()
      },
    }
  }

  get streamingIndex(): number | null {
    return this.session.streamingIndex
  }

  removeMessage(index: number): void {
    const prev = this.store.value
    this.store.removeAt(index)
    this.addHistory(prev, this.store.value)
    this.opts.onChange?.(this.store.value)
    this.notify()
  }
}

// --- View ---
export function UChatMessageListControlView(props: {
  data: UChatControl
}): JSX.Element {
  const control = props.data
  const messages = useControlValue<UChat>(control)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight
    }
  }, [messages])

  const copyMessageToClipboard = async (index: number) => {
    const target = messages[index]
    if (!target) return
    await navigator.clipboard.writeText(extractTextContent(target))
  }

  const deleteMsg = (index: number) => {
    control.removeMessage(index)
  }

  const startEdit = (index: number) => {
    const msg = messages[index]
    if (!msg) return
    setEditIndex(index)
    setEditText(extractTextContent(msg))
  }

  const cancelEdit = () => {
    setEditIndex(null)
    setEditText('')
  }

  const commitEdit = (index: number) => {
    const base = messages[index]
    if (!base) return
    control.modifyChatMessage(index, {
      ...base,
      content: [{ type: 'text', text: editText }],
    })
    cancelEdit()
  }

  return (
    <Drag.NoDrag>
      <div
        ref={scrollContainerRef}
        className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2"
      >
        {messages.map((msg, index) => (
          <div
            key={messageKey(msg, index)}
            className="flex flex-col gap-2 border border-muted rounded-md p-3 shadow-sm bg-card"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold flex gap-2 items-center">
                <span>{msg.role}</span>
                {msg.model ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {msg.model}
                  </span>
                ) : null}
                {msg.created_at ? (
                  <span className="text-[10px] text-muted-foreground/60">
                    {msg.created_at}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="bg-muted/40 p-3 rounded-md border border-muted min-h-[80px]">
              {renderMessageBody({
                msg,
                index,
                editIndex,
                editText,
                setEditText,
                commitEdit,
                cancelEdit,
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                {msg.tokensPerSecond !== undefined && (
                  <span className="text-xs text-gray-500 mr-1">
                    {msg.tokensPerSecond.toFixed(3)} tps
                  </span>
                )}
                <span className="text-xs text-gray-500 mr-1">
                  {msg.stopReason ?? ''}
                </span>
                <ToolButton
                  icon={<Copy size={14} />}
                  onClick={() => copyMessageToClipboard(index)}
                />
                <ToolButton
                  icon={<Pencil size={14} />}
                  onClick={() => startEdit(index)}
                />
                <ToolButton
                  icon={<Trash2 size={14} />}
                  onClick={() => deleteMsg(index)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Drag.NoDrag>
  )
}

function renderMessageBody({
  msg,
  index,
  editIndex,
  editText,
  setEditText,
  commitEdit,
  cancelEdit,
}: {
  msg: UChatMessage
  index: number
  editIndex: number | null
  editText: string
  setEditText: (value: string) => void
  commitEdit: (idx: number) => void
  cancelEdit: () => void
}): JSX.Element {
  if (editIndex === index) {
    return (
      <div className="flex flex-col gap-2">
        <Editor
          height="200px"
          defaultLanguage="markdown"
          value={editText}
          onChange={next => setEditText(next ?? '')}
          theme="vs-dark"
        />
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-emerald-500 text-white hover:bg-emerald-600"
            onClick={() => commitEdit(index)}
          >
            <Check size={14} />
            Apply
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-muted hover:bg-muted-foreground/10"
            onClick={cancelEdit}
          >
            <X size={14} />
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {msg.content.map((part, partIndex) => (
        <div key={partKey(part, partIndex)} className="text-sm leading-relaxed">
          {renderPart(part, partIndex)}
        </div>
      ))}
    </div>
  )
}

function renderPart(part: UPart, partIndex: number): JSX.Element | null {
  switch (part.type) {
    case 'text':
      return (
        <Markdown key={partIndex} remarkPlugins={[remarkGfm]}>
          {part.text}
        </Markdown>
      )
    case 'image':
      return renderImagePart(part, partIndex)
    case 'file':
      return renderFilePart(part, partIndex)
    default:
      return null
  }
}

function ToolButton({
  icon,
  onClick,
  ...props
}: {
  icon: JSX.Element
  onClick: () => void
} & React.ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element {
  return (
    <button
      type="button"
      className="w-[16px] h-[16px] flex items-center justify-center hover:bg-accent/80 rounded-sm"
      onClick={onClick}
      {...props}
    >
      {icon}
    </button>
  )
}

function renderImagePart(
  part: Extract<UPart, { type: 'image' }>,
  key: string | number
): JSX.Element | null {
  switch (part.source.kind) {
    case 'url':
      return <img key={key} src={part.source.url} alt="message" />
    case 'path':
      return (
        <img
          key={key}
          src={`file://${part.source.path}`}
          alt={part.source.path}
        />
      )
    case 'data':
      return (
        <img
          key={key}
          src={`data:image/*;base64,${part.source.data}`}
          alt="message"
        />
      )
    case 'id':
      return (
        <div key={key} className="text-xs text-gray-500">
          ID: {part.source.id}
        </div>
      )
    default:
      return null
  }
}

function renderFilePart(
  part: Extract<UPart, { type: 'file' }>,
  key: string | number
): JSX.Element | null {
  switch (part.source.kind) {
    case 'data': {
      const href = `data:application/octet-stream;base64,${part.source.data}`
      return (
        <a key={key} download={part.name} href={href}>
          {part.name}
        </a>
      )
    }
    case 'url':
      return (
        <a key={key} href={part.source.url} target="_blank" rel="noreferrer">
          {part.name}
        </a>
      )
    case 'path':
      return (
        <a
          key={key}
          href={`file://${part.source.path}`}
          target="_blank"
          rel="noreferrer"
        >
          {part.name}
        </a>
      )
    case 'id':
      return (
        <div key={key} className="text-xs text-gray-500">
          ID: {part.source.id}
        </div>
      )
    default:
      return null
  }
}

function messageKey(msg: UChatMessage, index: number): string | number {
  if (msg.id) return msg.id
  const text = extractTextContent(msg)
  const head = text.slice(0, 50)
  const base = `${msg.role}|${msg.model ?? ''}|${msg.created_at ?? ''}|${head}|${text.length}`
  return base || index
}

function partKey(part: UPart, index: number): string | number {
  if (part.type === 'text') {
    const text = part.text
    return `t|${text.slice(0, 48)}|${text.length}`
  }
  if (part.type === 'image') {
    const source = part.source
    if (source.kind === 'url') return `img|url|${source.url}`
    if (source.kind === 'path') return `img|path|${source.path}`
    if (source.kind === 'id') return `img|id|${source.id}`
    if (source.kind === 'data')
      return `img|data|${source.encoding}|${source.data.length}`
  }
  if (part.type === 'file') {
    const source = part.source
    const name = part.name ?? ''
    if (source.kind === 'url') return `file|url|${name}|${source.url}`
    if (source.kind === 'path') return `file|path|${name}|${source.path}`
    if (source.kind === 'id') return `file|id|${name}|${source.id}`
    if (source.kind === 'data') {
      return `file|data|${name}|${source.encoding}|${source.data.length}`
    }
  }
  return index
}
