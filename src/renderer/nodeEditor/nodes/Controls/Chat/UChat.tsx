// UChatMessageListControl.tsx

import { Check, Copy, GitBranch, Pencil, Trash2, X } from 'lucide-react'
import { type JSX, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import {
  BaseControl,
  type ControlOptions,
  useControlValue,
} from 'renderer/nodeEditor/types'
import type {
  UChat,
  UChatMessage,
  UPart,
} from 'renderer/nodeEditor/types/Schemas/UChat/UChatMessage'
import { Drag } from 'rete-react-plugin'

export interface DeltaStreamFunctions {
  start(initial?: Partial<UChatMessage>): void
  setInfo(info: Partial<UChatMessage>): void
  pushDelta(delta: string): void
  finish(finalText?: string, message?: Partial<UChatMessage>): void
}

export interface UChatControlParams
  extends ControlOptions<UChat> {
  value: UChat
}

export class UChatControl extends BaseControl<
  UChat,
  UChatControlParams
> {
  messages: UChat
  private streamBuffer = ''

  constructor(options: UChatControlParams) {
    super(options)
    this.messages = options.value ?? []
  }

  setValue(value: UChat): void {
    this.messages = value
    this.opts.onChange?.(value)
    this.notify()
  }

  getValue(): UChat {
    return this.messages
  }

  createSystemPromptMessage(text: string): UChatMessage {
    return { role: 'system', content: [{ type: 'text', text }] }
  }

  addMessage(msg: UChatMessage): void {
    const prev = [...this.messages]
    this.messages = [...this.messages, msg]
    this.addHistory(prev, this.messages)
    this.opts.onChange?.(this.messages)
    this.notify()
  }

  modifyChatMessage(index: number, msg: UChatMessage): void {
    const prev = [...this.messages]
    const next = [...this.messages]
    next[index] = msg
    this.messages = next
    this.addHistory(prev, next)
    this.opts.onChange?.(next)
    this.notify()
  }

  clear(): void {
    const prev = [...this.messages]
    this.messages = []
    this.addHistory(prev, this.messages)
    this.opts.onChange?.(this.messages)
    this.notify()
  }

  getLastMessage(): UChatMessage | undefined {
    return this.messages[this.messages.length - 1]
  }

  removeMessage(index: number): void {
    const prev = [...this.messages]
    const next = [...this.messages]
    next.splice(index, 1)
    this.messages = next
    this.addHistory(prev, next)
    this.opts.onChange?.(next)
    this.notify()
  }

  // システムメッセージを追加したコピーを返す
  getMessagesWithSystemPrompt(text: string): UChat {
    const system = this.createSystemPromptMessage(text)
    return [system, ...this.messages]
  }

  setupDeltaFunctions(): DeltaStreamFunctions {
    let index = -1
    let prev: UChat = []
    let inFlight = false
    const getMsg = () => this.messages[index]

    return {
      start: (initial?: Partial<UChatMessage>) => {
        if (inFlight) {
          console.warn('Delta stream already started')
          return
        }
        inFlight = true
        this.streamBuffer = ''
        const base: UChatMessage = {
          role: 'assistant',
          content: [{ type: 'text', text: '' }],
          ...initial,
        }
        prev = [...this.messages]
        index = this.messages.length
        this.messages = [...this.messages, base]
        this.notify()
      },
      setInfo: (info: Partial<UChatMessage>) => {
        const msg = getMsg()
        if (!msg) return
        Object.assign(msg, info)
        this.messages = [...this.messages]
        this.notify()
      },
      pushDelta: (delta: string) => {
        if (!inFlight) return
        const msg = getMsg()
        if (!msg || msg.role !== 'assistant') return
        this.streamBuffer += delta
        msg.content = [{ type: 'text', text: this.streamBuffer }]
        this.messages = [...this.messages]
        this.notify()
      },
      finish: (text?: string, message?: UChatMessage) => {
        if (!inFlight) return
        inFlight = false
        const msg = getMsg()
        if (!msg) return
        index = -1
        Object.assign(msg, message)
        msg.content = [{ type: 'text', text: text ?? this.streamBuffer }]
        const next = [...this.messages]
        this.messages = next
        this.addHistory(prev, next)
        this.opts.onChange?.(next)
        this.notify()
      },
    }
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [editText, editIndex])

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight
    }
  }, [messages.length])

  // メッセージからテキストコンテンツを抽出して連結する関数
  const extractTextContent = (msg: UChatMessage): string => {
    return msg.content
      .filter(part => part.type === 'text')
      .map(part => part.text)
      .join('\n');
  }

  // テキストをクリップボードにコピーする関数
  const copyMessageToClipboard = (index: number): void => {
    const msg = messages[index];
    if (!msg) return;

    navigator.clipboard.writeText(extractTextContent(msg))
      .then(() => console.log('Message copied to clipboard'))
      .catch(err => console.error('Failed to copy: ', err));
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
    const contents = msg.content.filter(c => c.type !== 'text')
    control.modifyChatMessage(editIndex, { ...msg, content: [{ type: 'text', text: editText }, ...contents] })
    setEditIndex(null)
  }

  const cancelEdit = () => setEditIndex(null)
  const deleteMsg = (index: number) => control.removeMessage(index)


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
        {messages.map((msg, index) => (
          <div key={index} className="rounded group">
            <div className="group-hover:bg-node-header/30 py-1.5 px-3">
              <strong className="block mb-1">
                {msg.role}
                {msg.model && (
                  <span className="ml-2 text-xs text-gray-400 font-light">
                    {msg.model}
                  </span>
                )}
              </strong>
              {editIndex === index ? (
                <div>
                  <textarea
                    className="w-full border mb-1"
                    ref={textareaRef}
                    style={{ overflow: 'hidden' }}
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
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
                <div className="break-all">
                  {msg.content.map((part, i) => {
                    if (part.type === 'text') {
                      return (
                        <Markdown key={i} remarkPlugins={[remarkGfm]}>
                          {part.text}
                        </Markdown>
                      )
                    }
                    if (part.type === 'image') {
                      return renderImagePart(part, i)
                    }
                    if (part.type === 'file') {
                      return renderFilePart(part, i)
                    }
                    return null
                  })}
                </div>
              )}
            </div>

            {msg.role !== 'system' && editIndex !== index && (
              <div className="flex justify-end items-center py-0.5">
                <div
                  className={`flex gap-1 text-xs ${index !== messages.length - 1 ? 'opacity-0 group-hover:opacity-100 transition-opacity duration-200' : ''}`}
                >
                  {msg.tokensPerSecond != null && (
                    <span className="text-xs text-gray-500 mr-1">
                      {msg.tokensPerSecond} tps
                    </span>
                  )}
                  <ToolButton
                    icon={<GitBranch size={14} />}
                    onClick={() => { }}
                  />
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
function renderImagePart(part: Extract<UPart, { type: 'image' }>, key: number): JSX.Element | null {
  switch (part.source.kind) {
    case 'url':
      return <img key={key} src={part.source.url} alt="message" />
    case 'path':
      return <img key={key} src={`file://${part.source.path}`} alt={part.source.path} />
    case 'data':
      return <img key={key} src={`data:image/*;base64,${part.source.data}`} alt="message" />
    case 'id':
      return <div key={key} className="text-xs text-gray-500">ID: {part.source.id}</div>
    default:
      return null
  }
}

function renderFilePart(part: Extract<UPart, { type: 'file' }>, key: number): JSX.Element | null {
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
        <a key={key} href={`file://${part.source.path}`} target="_blank" rel="noreferrer">
          {part.name}
        </a>
      )
    case 'id':
      return <div key={key} className="text-xs text-gray-500">ID: {part.source.id}</div>
    default:
      return null
  }
}
