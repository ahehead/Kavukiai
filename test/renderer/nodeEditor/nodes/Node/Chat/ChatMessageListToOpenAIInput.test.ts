import { expect, test } from 'vitest'
import { ChatMessageListToOpenAIInput } from 'renderer/nodeEditor/nodes/Node/Chat/ChatMessageListToOpenAIInput'
import type { ChatMessageItem } from 'renderer/nodeEditor/types/Schemas'

const node = new ChatMessageListToOpenAIInput()

const messages: ChatMessageItem[] = [
  {
    id: '1',
    content: [{ type: 'input_text', text: 'hello' }],
    role: 'user',
    type: 'message',
  },
]

test('ChatMessageListToOpenAIInput converts messages to ResponseInput', () => {
  const result = node.data({ list: [messages] })
  expect(result.out).toEqual([
    {
      id: '1',
      content: [{ type: 'input_text', text: 'hello' }],
      role: 'user',
      type: 'message',
    },
  ])
})
