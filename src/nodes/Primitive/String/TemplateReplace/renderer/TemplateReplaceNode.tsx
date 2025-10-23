import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { ConsoleControl } from 'renderer/nodeEditor/nodes/Controls/Console/Console'
import { evaluateTemplate } from 'renderer/nodeEditor/nodes/util/templatePlaceholders'
import type { Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { NodeStatus, SerializableInputsNode } from 'renderer/nodeEditor/types'

import type { ControlFlowEngine } from 'rete-engine'

export class TemplateReplaceNode extends SerializableInputsNode<
  'TemplateReplace',
  { exec: TypedSocket; template: TypedSocket; obj: TypedSocket },
  { exec: TypedSocket; out: TypedSocket },
  { console: ConsoleControl }
> {
  private result = ''
  constructor(
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('TemplateReplace')
    this.addInputPort([
      {
        key: 'exec',
        label: 'Run',
        onClick: () => {
          this.controlflow.execute(this.id, 'exec')
        },
      },
      { key: 'template', typeName: 'string', label: 'template' },
      { key: 'obj', typeName: 'object', label: 'object' },
    ])
    this.addOutputPort([
      { key: 'exec', typeName: 'exec', label: 'Out' },
      { key: 'out', typeName: 'string', label: 'Result' },
    ])
    this.addControl('console', new ConsoleControl({ isOpen: true }))
  }

  data(): { out: string } {
    return { out: this.result }
  }

  async execute(_: never, forward: (output: 'exec') => void): Promise<void> {
    const [template, obj] = await this.dataflow.fetchInputMultiple<[
      string,
      Record<string, unknown>
    ]>(this.id, ['template', 'obj'])
    const { result, missingKeys } = evaluateTemplate(template, obj)
    this.result = result
    this.controls.console.addValue(
      `Deserialized result: ${this.result}`
    )
    this.dataflow.reset(this.id)
    this.changeStatus(
      missingKeys.length > 0 ? NodeStatus.WARNING : NodeStatus.IDLE
    )
    forward('exec')
  }

  serializeControlValue(): { data: { result: string } } {
    return {
      data: {
        result: this.result,
      },
    }
  }

  deserializeControlValue(data: { result: string }): void {
    this.result = data.result
  }
}
