import { expect, test } from 'vitest'
import { ReverseUserAssistantRoleNode } from 'renderer/nodeEditor/nodes/Node/Chat/ReverseUserAssistantRoleNode'
import type { ChatMessageItem } from 'renderer/nodeEditor/types/Schemas'

const node = new ReverseUserAssistantRoleNode()
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

test('ReverseUserAssistantRoleNode swaps roles', () => {
  const result = node.data({ list: [messages] })
  expect(result.list[0].role).toBe('assistant')
  expect(result.list[1].role).toBe('user')
})
