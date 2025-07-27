import { expect, test } from 'vitest'
import { ChatMessageListToStringNode } from 'renderer/nodeEditor/nodes/Node/Chat/ChatMessageListToStringNode'
import type { ChatMessageItem } from 'renderer/nodeEditor/types/Schemas'

const node = new ChatMessageListToStringNode()
const messages: ChatMessageItem[] = [
  {
    id: '1',
    content: [{ type: 'input_text', text: 'hello' }],
    role: 'user',
    type: 'message',
  },
  {
    id: '2',
    content: [{ type: 'input_text', text: 'world' }],
    role: 'assistant',
    type: 'message',
  },
]

test('ChatMessageListToStringNode without role', () => {
  const result = node.data({ list: [messages] })
  expect(result.out).toBe('hello\n\nworld')
})

test('ChatMessageListToStringNode with custom roles', () => {
  const result = node.data({
    list: [messages],
    isAddRole: [true],
    userString: ['U'],
    assistantString: ['A'],
  })
  expect(result.out).toBe('U\nhello\n\nA\nworld')
})
