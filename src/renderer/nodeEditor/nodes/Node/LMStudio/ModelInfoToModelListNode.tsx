import { SerializableInputsNode } from '../../../types/Node/SerializableInputsNode'
import type { TypedSocket } from '../../../types'

export class ModelInfoToModelListNode extends SerializableInputsNode<
  { list: TypedSocket },
  { list: TypedSocket },
  Record<string, never>
> {
  private modelKeys: string[] = []

  constructor() {
    super('ModelInfoToModelList')

    this.addInputPort({
      key: 'list',
      typeName: 'ModelInfoArray',
      label: 'ModelInfo',
    })

    this.addOutputPort({
      key: 'list',
      typeName: 'StringArray',
      label: 'ModelKeys',
    })
  }

  data(): { list: string[] } {
    return { list: this.modelKeys }
  }

  serializeControlValue(): { data: { list: string[] } } {
    return { data: { list: this.modelKeys } }
  }

  deserializeControlValue(data: { list: string[] }): void {
    this.modelKeys = data.list
  }
}
