// UChatMessageListControl.tsx

import { Editor } from '@monaco-editor/react'
import {
  extractTextContent,
  type UChat,
  type UChatMessage,
  type UPart,
} from '@nodes/Chat/common/schema'
import { Check, Copy, Pencil, Trash2, X } from 'lucide-react'
import { type JSX, useEffect, useRef, useState } from 'react'
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
  private store: ChatStore
  private session: DeltaSession

  constructor(opts: UChatControlParams) {
    super(opts)
    this.store = new ChatStore(opts.value ?? [])
    this.session = new DeltaSession(this.store)
  }

  getValue() {
    return this.store.value
  }
  setValue(v: UChat) {
    const prev = this.store.value
    this.store.setAll(v)
    this.addHistory(prev, this.store.value)
    this.opts.onChange?.(this.store.value)
    this.notify()
  }

  addMessage(m: UChatMessage) {
    const prev = this.store.value
    this.store.add(m)
    this.addHistory(prev, this.store.value)
    this.opts.onChange?.(this.store.value)
    this.notify()
  }
  modifyChatMessage(i: number, m: UChatMessage) {
    const prev = this.store.value
    this.store.modifyAt(i, m)
    this.addHistory(prev, this.store.value)
    this.opts.onChange?.(this.store.value)
    this.notify()
  }
  clear() {
    const prev = this.store.value
    this.store.clear()
    this.addHistory(prev, this.store.value)
    this.opts.onChange?.(this.store.value)
    this.notify()
  }

  getMessagesWithSystemPrompt(text: string) {
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
      pushDelta: d => {
        this.session.delta(d)
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

  get streamingIndex() {
    return this.session.streamingIndex
  }

  removeMessage(i: number) {
    const prev = this.store.value
    this.store.removeAt(i)
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
  }, [messages.length])

  // テキストをクリップボードにコピーする関数
  const copyMessageToClipboard = (index: number): void => {
    const msg = messages[index]
    if (!msg) return

    navigator.clipboard
      .writeText(extractTextContent(msg))
      .then(() => console.log('Message copied to clipboard'))
      .catch(err => console.error('Failed to copy: ', err))
  }

  const startEdit = (index: number) => {
    const msg = messages[index]
    setEditText(extractTextContent(msg))
    setEditIndex(index)
  }

  const saveEdit = () => {
    if (editIndex === null) return
    const msg = messages[editIndex]
    if (!msg) return
    const contents = msg.content.filter((c: UPart) => c.type !== 'text')
    control.modifyChatMessage(editIndex, {
      ...msg,
      content: [{ type: 'text', text: editText }, ...contents],
    })
    setEditIndex(null)
  }

  const cancelEdit = () => setEditIndex(null)
  const deleteMsg = (index: number) => control.removeMessage(index)

  const lineCount = editText.split('\n').length
  const h = Math.min(600, Math.max(120, lineCount * 20))

  return (
    <Drag.NoDrag>
      <div
        ref={scrollContainerRef}
        className="flex-1 w-full h-full min-h-0 overflow-y-auto pb-2 border-t border-gray-200"
      >
        {messages.length === 0 && (
          <div className="w-full flex items-center justify-center ">
            <div className="p-3 text-gray-600">No messages</div>
          </div>
        )}
        {messages.map((msg: UChatMessage, index: number) => (
          <div key={messageKey(msg, index)} className="rounded group last:mb-2">
            <div className="group-hover:bg-node-header/30 py-1.5 px-3">
              <strong className="block mb-1 select-text">
                {msg.role}
                {msg.model && (
                  <span className="ml-2 text-xs text-gray-400 font-light">
                    {msg.model}
                  </span>
                )}
              </strong>
              {editIndex === index ? (
                <div className="flex flex-col">
                  <Editor
                    width={'100%'}
                    height={h}
                    value={editText}
                    wrapperProps={{ 'data-monaco-editor': 'true' }}
                    onChange={(value: string | undefined, _e) =>
                      setEditText(value ?? '')
                    }
                    options={{
                      wordWrap: 'on',
                      minimap: { enabled: false },
                      lineNumbers: 'off',
                      glyphMargin: false,
                      folding: false,
                      renderWhitespace: 'none',
                      automaticLayout: true,
                      renderLineHighlight: 'none',
                      renderLineHighlightOnlyWhenFocus: false,
                    }}
                  />
                  <div className="flex justify-end gap-1">
                    <Check
                      size={14}
                      className="cursor-pointer"
                      onClick={saveEdit}
                    />
                    <X
                      size={14}
                      className="cursor-pointer"
                      onClick={cancelEdit}
                    />
                  </div>
                </div>
              ) : (
                <div className="break-all select-text">
                  {msg.content.map((part: UPart, i: number) => {
                    // ストリーミング中かどうか（メッセージ単位）
                    const isStreaming = control.streamingIndex === index
                    if (part.type === 'text') {
                      // ストリーミング中はMarkdownの再レイアウトを避けて<pre>で表示、
                      // 完了後はMarkdownで整形して表示
                      return isStreaming ? (
                        <pre
                          key={partKey(part, i)}
                          className="whitespace-pre-wrap break-words select-text"
                        >
                          {part.text}
                        </pre>
                      ) : (
                        <Markdown
                          key={partKey(part, i)}
                          remarkPlugins={[remarkGfm]}
                        >
                          {part.text}
                        </Markdown>
                      )
                    }
                    if (part.type === 'image') {
                      return renderImagePart(part, partKey(part, i))
                    }
                    if (part.type === 'file') {
                      return renderFilePart(part, partKey(part, i))
                    }
                    return null
                  })}
                </div>
              )}
            </div>

            {msg.role !== 'system' &&
              editIndex !== index &&
              control.streamingIndex !== index && (
                <div className="flex justify-end items-center py-0.5">
                  <div
                    className={`flex gap-1 text-xs ${index !== messages.length - 1 ? 'opacity-0 group-hover:opacity-100 transition-opacity duration-200' : ''}`}
                  >
                    {msg.tokensPerSecond != null && (
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
              )}
          </div>
        ))}
      </div>
    </Drag.NoDrag>
  )
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

// --- パート別描画ヘルパー ---
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
  // できるだけ安定した情報で合成（idが無い古いデータ向け）
  const base = `${msg.role}|${msg.model ?? ''}|${msg.created_at ?? ''}|${head}|${text.length}`
  return base || index
}

function partKey(part: UPart, index: number): string | number {
  if (part.type === 'text') {
    const t = part.text
    return `t|${t.slice(0, 48)}|${t.length}`
  }
  if (part.type === 'image') {
    const s = part.source
    if (s.kind === 'url') return `img|url|${s.url}`
    if (s.kind === 'path') return `img|path|${s.path}`
    if (s.kind === 'id') return `img|id|${s.id}`
    if (s.kind === 'data') return `img|data|${s.encoding}|${s.data.length}`
  }
  if (part.type === 'file') {
    const s = part.source
    const name = part.name ?? ''
    if (s.kind === 'url') return `file|url|${name}|${s.url}`
    if (s.kind === 'path') return `file|path|${name}|${s.path}`
    if (s.kind === 'id') return `file|id|${name}|${s.id}`
    if (s.kind === 'data')
      return `file|data|${name}|${s.encoding}|${s.data.length}`
  }
  return index
}
