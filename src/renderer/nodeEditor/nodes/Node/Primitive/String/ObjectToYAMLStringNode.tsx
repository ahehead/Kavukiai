import { SerializableInputsNode, type TypedSocket } from 'renderer/nodeEditor/types'
import YAML from 'yaml'

export class ObjectToYAMLStringNode extends SerializableInputsNode<
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
