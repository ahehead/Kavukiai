import { expect, test } from 'vitest';
import { UChatToOpenAINode } from 'renderer/nodeEditor/nodes/Node/Chat/UChatToOpenAINode';
import type { UChat } from 'renderer/nodeEditor/types/Schemas';

test('UChatToOpenAINode converts UChat to ResponseInput', () => {
  const node = new UChatToOpenAINode();
  const chat: UChat = [
    { role: 'user', content: [{ type: 'text', text: 'hello' }] },
  ];
  const result = node.data({ uChat: [chat] });
  expect(result.out).toEqual([
    {
      role: 'user',
      content: 'hello',
      type: 'message',
    },
  ]);
});
