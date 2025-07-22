import type { TypedSocket } from 'renderer/nodeEditor/types'
import { BaseNode } from 'renderer/nodeEditor/types/Node/BaseNode'
import YAML from 'yaml'

export class ObjectToYAMLStringNode extends BaseNode<
  'ObjectToYAMLString',
  { obj: TypedSocket },
  { out: TypedSocket },
  object
> {
  constructor() {
    super('ObjectToYAMLString')
    this.addInputPort({ key: 'obj', typeName: 'object', label: 'object' })
    this.addOutputPort({ key: 'out', typeName: 'string', label: 'out' })
  }

  data(inputs: { obj?: Record<string, unknown>[] }): { out: string } {
    const v = inputs.obj?.[0]
    return { out: v === undefined ? '' : YAML.stringify(v) }
  }

  async execute(): Promise<void> { }
}
