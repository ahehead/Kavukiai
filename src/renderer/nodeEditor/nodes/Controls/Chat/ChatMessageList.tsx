import { Check, Copy, GitBranch, Pencil, Trash2, X } from 'lucide-react'
import { type JSX, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  BaseControl,
  type ControlOptions,
  useControlValue,
} from 'renderer/nodeEditor/types'
import {
  type ChatMessageItem,
  isEasyChatMessage,
  isInputTextContent,
} from 'renderer/nodeEditor/types/Schemas/ChatMessageItem'
import { Drag } from 'rete-react-plugin'

export interface DeltaFunctions {
  start(initial?: Partial<ChatMessageItem>): void;
  setId(id: string): void;
  setInfo(info: Partial<ChatMessageItem>): void;
  pushDelta(delta: string): void;
  finish(finalText?: string): void;
}

export interface ChatMessageListControlParams
  extends ControlOptions<ChatMessageItem[]> {
  value: ChatMessageItem[]
}

export class ChatMessageListControl extends BaseControl<
  ChatMessageItem[],
  ChatMessageListControlParams
> {
  messages: ChatMessageItem[]
  totalTokens = 0
  messageTemp = ''

  constructor(options: ChatMessageListControlParams) {
    super(options)
    this.messages = options.value ?? []
  }

  setValue(value: ChatMessageItem[]): void {
    this.messages = value
    this.opts.onChange?.(value)
    this.notify()
  }

  getValue(): ChatMessageItem[] {
    return this.messages
  }

  createSystemPromptMessage(text: string): ChatMessageItem {
    return {
      type: 'message',
      role: 'system',
      content: [{ type: 'input_text', text: text }],
    }
  }

  addMessage(msg: ChatMessageItem): void {
    const prev = [...this.messages]
    this.messages = [...this.messages, msg]
    this.addHistory(prev, this.messages)
    this.opts.onChange?.(this.messages)
    this.notify()
  }

  // delta event用
  // 一時的にMessageを追加して、indexを返す
  addTempMessage(msg: ChatMessageItem): number {
    this.messages = [...this.messages, msg]
    return this.messages.length - 1
  }

  // delta event用
  // 一時messageのidを設定する
  setTempMessageId(index: number, id: string): void {
    const message = this.messages[index]
    if (message) {
      message.id = id
      this.messages = [...this.messages]
      this.notify()
    } else {
      console.error(`Message at index ${index} not found.`)
    }
  }

  // delta event用
  // indexのメッセージの内容をdeltaで書き換えていく
  modifyMessageTextDelta(index: number, deltaString: string): void {
    this.messageTemp += deltaString
    const message = this.messages[index]
    if (message && message.role === 'assistant') {
      message.content = this.messageTemp
      this.messages = [...this.messages]
    }
    this.notify()
  }

  // delta event用
  // indexのメッセージの内容をtextで確定する
  modifyMessageTextDone(index: number, text: string): void {
    this.messageTemp = ''
    const message = this.messages[index]
    if (message && message.role === 'assistant') {
      message.content = text
      this.messages = [...this.messages]
      this.addHistory(this.messages, this.messages)
      this.opts.onChange?.(this.messages)
      this.notify()
    }
  }

  modifyChatMessage(index: number, msg: ChatMessageItem): void {
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

  getLastMessage(): ChatMessageItem | undefined {
    return this.messages[this.messages.length - 1]
  }

  getById(id: string): ChatMessageItem | undefined {
    return this.messages.find(msg => msg.id === id)
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

  // システムメッセージを追加したthis.messagesのコピーを返す
  getMessagesWithSystemPrompt(text: string): ChatMessageItem[] {
    const systemMessage = this.createSystemPromptMessage(text)
    return [systemMessage, ...this.messages]
  }

  setupDeltaFunctions(): DeltaFunctions {
    let index = -1;
    let prev: ChatMessageItem[] = [];
    let buffer = '' // このストリーム専用バッファ
    let inFlight = false;
    const getMsg: () => ChatMessageItem | undefined = () => this.messages[index]

    return {
      start: (initial?: Partial<ChatMessageItem>) => {
        if (inFlight) {
          console.warn('Delta stream already started');
          return;
        }
        inFlight = true
        buffer = ''
        const base: ChatMessageItem = {
          ...initial,
          role: 'assistant',
          type: 'message',
          content: '',
        }
        prev = [...this.messages] // 追加（history は finish まで遅延）
        index = this.messages.length
        this.messages = [...this.messages, base]
        this.notify()
      },
      /** id が後から分かったとき */
      setId: (id: string) => {
        const msg = getMsg()
        if (!msg) return
        msg.id = id
        this.messages = [...this.messages]
        this.notify()
      },
      /** 他の情報がわかったとき */
      setInfo: (info: Partial<ChatMessageItem>) => {
        const msg = getMsg()
        if (!msg) return
        Object.assign(msg, info)
        this.messages = [...this.messages]
        this.notify()
      },
      /** delta を追加 */
      pushDelta: (delta: string) => {
        if (!inFlight) return;
        const msg = getMsg()
        if (!msg || msg.role !== 'assistant') return
        buffer += delta
        msg.content = buffer
        this.messages = [...this.messages]
        this.notify()
      },
      /** 終了（history + onChange 発火,エラー時もそのまま残したいのでこれを呼ぶ */
      finish: (text?: string) => {
        if (!inFlight) return;
        inFlight = false;
        const msg = getMsg()
        if (!msg) return
        msg.content = text ?? buffer
        const next = [...this.messages]
        this.messages = next
        this.addHistory(prev, next)
        this.opts.onChange?.(next)
        this.notify()
      },
    }
  }
}

export function ChatMesaageListControlView(props: {
  data: ChatMessageListControl
}): JSX.Element {
  const control = props.data
  const messages = useControlValue<ChatMessageItem[]>(control)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  // Ref for auto-resizing textarea in edit mode
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Adjust textarea height to fit content on editIndex or editText change
  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [editText, editIndex])

  // メッセージが追加されたときに一番下までスクロール
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight
    }
  }, [messages.length])

  const startEdit = (index: number) => {
    const msg = messages[index]
    let text = ''
    if (Array.isArray(msg.content) && msg.content.length > 0) {
      // Join all text content in the message
      text = msg.content
        .filter(isInputTextContent)
        .map(c => c.text)
        .join('\n')
    } else if (msg.role === 'assistant' && typeof msg.content === 'string') {
      text = msg.content
    }
    setEditText(text)
    setEditIndex(index)
  }

  const saveEdit = () => {
    if (editIndex === null) return
    const msg = messages[editIndex]
    if (!msg) return

    const updated = {
      ...msg,
      content: isEasyChatMessage(msg)
        ? editText
        : [{ type: 'input_text', text: editText }],
    } as ChatMessageItem

    control.modifyChatMessage(editIndex, updated)
    setEditIndex(null)
  }

  const cancelEdit = () => setEditIndex(null)

  const deleteMsg = (index: number) => {
    control.removeMessage(index)
  }

  return (
    <Drag.NoDrag>
      <div
        ref={scrollContainerRef}
        className="flex-1 w-full h-full min-h-0 overflow-y-auto pb-2"
      >
        {messages.length === 0 && (
          <div className="w-full flex items-center justify-center ">
            <div className="p-3 text-gray-600">No messages</div>
          </div>
        )}
        {messages.map((msg, index) => (
          // Message Item
          // biome-ignore lint/suspicious/noArrayIndexKey: message list order doesn't change
          <div key={index} className="rounded group">
            {/* Message Content Wrapper */}
            <div className="group-hover:bg-node-header/30 py-1.5 px-3">
              {/* role */}
              <strong className="block mb-1">{msg.role}</strong>
              {/* Edit Mode */}
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
                // Normal View
                <div className="break-all">
                  {isEasyChatMessage(msg) && (
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </Markdown>
                  )}
                  {Array.isArray(msg.content) &&
                    msg.content.map((contentItem, idx) => {
                      return (
                        <div
                          key={`${contentItem.type}-${idx}`}
                          className="mb-1"
                        >
                          {isInputTextContent(contentItem) && (
                            <Markdown remarkPlugins={[remarkGfm]}>
                              {contentItem.text}
                            </Markdown>
                          )}
                          {/* {isContentImage(contentItem) &&
                            contentItem.image_url && (
                              <img
                                src={contentItem.image_url}
                                alt="message-image"
                              />
                            )}
                          {isContentFile(contentItem) &&
                            contentItem.filename && (
                              <a
                                href={`data:application/octet-stream;base64,${contentItem.file_data}`}
                                download={contentItem.filename}
                              >
                                {contentItem.filename}
                              </a>
                            )} */}
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
            {/* tool ボタン */}
            {msg.role !== 'system' && editIndex !== index && (
              <div className="flex justify-end items-center py-0.5">
                <div
                  className={`flex gap-1 text-xs ${index !== messages.length - 1 ? 'opacity-0 group-hover:opacity-100 transition-opacity duration-200' : ''}`}
                >
                  <ToolButton
                    icon={<GitBranch size={14} />}
                    onClick={() => { }}
                  />
                  <ToolButton icon={<Copy size={14} />} onClick={() => { }} />
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
