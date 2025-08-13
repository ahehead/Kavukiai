import type { ModelInfo } from '@lmstudio/sdk'
import type { TypedSocket } from '../../../types'
import { SerializableInputsNode } from '../../../types/Node/SerializableInputsNode'

export class ModelInfoToModelListNode extends SerializableInputsNode<
  'ModelInfoToModelList',
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

  data(inputs?: { list?: ModelInfo[][] }): { list: string[] } {
    const inputList = inputs?.list?.[0] || []
    this.modelKeys = inputList
      .filter(item => item.type === 'llm')
      .map(item => item.modelKey)
    return { list: this.modelKeys }
  }

  serializeControlValue(): { data: { list: string[] } } {
    return { data: { list: this.modelKeys } }
  }

  deserializeControlValue(data: { list: string[] }): void {
    this.modelKeys = data.list
  }
}
