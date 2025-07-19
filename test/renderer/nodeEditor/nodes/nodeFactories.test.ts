import { getContextMenuPath } from 'renderer/nodeEditor/nodes/util/getContextMenuPath'
import { describe, expect, it } from 'vitest'

describe('getContextMenuPath', () => {
  vi.stubGlobal('window', { App: {} })
  it('returns empty string for unknown key', () => {
    expect(getContextMenuPath('NonExistent' as any)).toBe('')
  })

  it('returns empty for Inspector key', () => {
    expect(getContextMenuPath('Inspector')).toBe('')
  })

  it('returns Primitive/String for String key', () => {
    expect(getContextMenuPath('String')).toBe('Primitive/String')
  })

  it('returns Primitive/Flow/IF for IF key', () => {
    expect(getContextMenuPath('IF')).toBe('Primitive/Flow')
  })

  it('returns OpenAI for OpenAI key', () => {
    expect(getContextMenuPath('OpenAI')).toBe('OpenAI')
  })

  it('returns OpenAI for ChatMessageList key', () => {
    expect(getContextMenuPath('ChatMessageList')).toBe('OpenAI')
  })

  it('returns OpenAI for ChatMessageListToOpenAIInput key', () => {
    expect(getContextMenuPath('ChatMessageListToOpenAIInput')).toBe('OpenAI')
  })
})
