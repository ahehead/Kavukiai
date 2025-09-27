import { evaluateTemplate } from 'renderer/nodeEditor/nodes/util/templatePlaceholders'
import { NodeStatus, SerializableInputsNode, type TypedSocket } from 'renderer/nodeEditor/types'

export class AutoTemplateReplaceNode extends SerializableInputsNode<
  'AutoTemplateReplace',
  { template: TypedSocket; obj: TypedSocket },
  { out: TypedSocket },
  object
> {
  constructor() {
    super('AutoTemplateReplace')
    this.addInputPort([
      { key: 'template', typeName: 'string', label: 'template' },
      { key: 'obj', typeName: 'object', label: 'object' },
    ])
    this.addOutputPort({ key: 'out', typeName: 'string', label: 'Result' })
  }

  data(inputs: {
    template?: string[]
    obj?: Record<string, unknown>[]
  }): { out: string } {
    const template = inputs.template?.[0] ?? ''
    const context = inputs.obj?.[0] ?? {}
    const { result, missingKeys } = evaluateTemplate(template, context)

    this.changeStatus(
      missingKeys.length > 0 ? NodeStatus.WARNING : NodeStatus.IDLE
    )

    return { out: result }
  }
}
