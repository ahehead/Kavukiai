import { type JSX, useState } from 'react'
import { BaseControl, type ControlOptions } from 'renderer/nodeEditor/types'
import type { ChatMessageItem, ResponseInputMessageContentList } from 'renderer/nodeEditor/types/Schemas/InputSchemas'
import { Drag } from 'rete-react-plugin'

export interface MessageInputControlParams
  extends ControlOptions<ResponseInputMessageContentList> {
  value?: ResponseInputMessageContentList
  onSend: (chatItem: ChatMessageItem) => void
  role?: 'user' | 'assistant'
  text?: string
}

export class MessageInputControl extends BaseControl<
  ResponseInputMessageContentList,
  MessageInputControlParams
> {
  role: 'user' | 'assistant'
  text: string
  onSend: (chatItem: ChatMessageItem) => void
  value: ResponseInputMessageContentList

  constructor(options: MessageInputControlParams) {
    super(options)
    this.role = options.role ?? 'user'
    this.text = options.text ?? ''
    this.onSend = options.onSend
    this.value = options.value ?? []
  }

  setValue(value: ResponseInputMessageContentList): void {
    this.value = value
  }

  getValue(): ResponseInputMessageContentList {
    return this.value
  }

  getChatMessageItem(): ChatMessageItem {
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      role: this.role,
      type: 'message',
      content: [{ type: 'input_text', text: this.text }],
    }
  }

  setText(text: string) {
    this.text = text
    this.opts.onChange?.(this.getValue())
  }

  getText(): string {
    return this.text
  }

  setRole(role: 'user' | 'assistant') {
    this.role = role
    this.opts.onChange?.(this.getValue())
  }

  getRole(): 'user' | 'assistant' {
    return this.role
  }

  clear() {
    this.text = ''
  }
}

export function MessageInputControlView(props: {
  data: MessageInputControl
}): JSX.Element {
  const control = props.data
  const [text, setText] = useState(control.text)
  const [role, setRole] = useState<'user' | 'assistant'>(control.role)

  const send = (e: React.MouseEvent<HTMLButtonElement>) => {
    control.setText(text)
    control.setRole(role)
    control.onSend(control.getChatMessageItem())
    control.clear()
    setText('')
  }

  const toggleRole = () => {
    const nextRole = role === 'user' ? 'assistant' : 'user'
    setRole(nextRole)
    control.setRole(nextRole)
  }

  return (
    <Drag.NoDrag>
      <div className="space-y-1">
        <textarea
          className="w-full border rounded p-1 text-sm"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div className="flex gap-1">
          <button className="border px-2 rounded" onClick={toggleRole}>
            {role}
          </button>
          <button className="flex-1 border px-2 rounded active:bg-accent/40" onClick={send}>
            Send
          </button>
        </div>
      </div>
    </Drag.NoDrag>
  )
}
