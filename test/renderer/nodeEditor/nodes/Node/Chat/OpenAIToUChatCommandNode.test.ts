import { expect, test } from 'vitest';
import { OpenAIToUChatCommandNode } from 'renderer/nodeEditor/nodes/Node/Chat/OpenAIToUChatCommandNode';

// simple final response with text message
const response: any = {
  id: 'res',
  created_at: 0,
  output_text: '',
  error: null,
  incomplete_details: null,
  instructions: null,
  metadata: null,
  model: 'gpt',
  object: 'response',
  output: [
    {
      id: 'm1',
      type: 'message',
      role: 'assistant',
      content: [{ type: 'output_text', text: 'hi' }],
      status: 'completed',
    },
  ],
  parallel_tool_calls: false,
  temperature: null,
  tool_choice: null,
  tools: [],
  top_p: null,
  background: null,
  max_output_tokens: null,
  previous_response_id: null,
  service_tier: 'default',
  status: 'completed',
  text: null,
  truncation: null,
  usage: { output_tokens: 1 },
};

test('OpenAIToUChatCommandNode converts response to event', () => {
  const node = new OpenAIToUChatCommandNode();
  const result = node.data({ response: [response] });
  expect(result.event?.type).toBe('response');
  expect(result.event?.messages[0].content[0]).toEqual({ type: 'text', text: 'hi' });
});
