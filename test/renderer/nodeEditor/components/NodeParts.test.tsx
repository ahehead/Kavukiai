/* biome-ignore lint/correctness/noUnusedImports: React is required for JSX */
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { NodeContainer, NodeHeader, NodeTitle } from 'renderer/nodeEditor/nodes/components/common/NodeParts'
import { NodeStatus } from 'renderer/nodeEditor/types'
import { describe, expect, test } from 'vitest'

describe('NodeParts', () => {
  test('NodeContainer sets data attributes', () => {
    const html = renderToStaticMarkup(
      <NodeContainer status={NodeStatus.IDLE} nodeType="Test" />
    )
    expect(html).toContain('data-status="IDLE"')
    expect(html).toContain('data-node-type="Test"')
  })

  test('NodeTitle renders children', () => {
    const html = renderToStaticMarkup(
      <NodeTitle status={NodeStatus.COMPLETED}>done</NodeTitle>
    )
    expect(html).toContain('done')
  })

  test('NodeHeader passes data attributes', () => {
    const html = renderToStaticMarkup(
      <NodeHeader status={NodeStatus.ERROR} nodeType="Err" />
    )
    expect(html).toContain('data-status="ERROR"')
    expect(html).toContain('data-node-type="Err"')
  })
})
