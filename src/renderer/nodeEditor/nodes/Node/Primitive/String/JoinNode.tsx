import type { TypedSocket } from 'renderer/nodeEditor/types'
import { BaseNode } from 'renderer/nodeEditor/types/Node/BaseNode'

// JoinNode: 文字列配列を結合して返す
export class JoinNode extends BaseNode<
  'Join',
  { list: TypedSocket; separator: TypedSocket },
  { out: TypedSocket },
  object
> {
  constructor() {
    super('Join')
    this.addInputPort([
      { key: 'list', typeName: 'StringArray', label: 'list' },
      { key: 'separator', typeName: 'string', label: 'separator' },
    ])
    this.addOutputPort({ key: 'out', typeName: 'string', label: 'out' })
  }

  data(inputs: { list?: string[][]; separator?: string[] }): { out: string } {
    const arr = inputs.list?.[0] ?? []
    const sep = inputs.separator?.[0] ?? ''
    return { out: Array.isArray(arr) ? arr.join(sep) : '' }
  }

  async execute(): Promise<void> {}
}
