import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { ConsoleControl } from 'renderer/nodeEditor/nodes/Controls/Console/Console'
import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { NodeStatus, SerializableInputsNode } from 'renderer/nodeEditor/types'

import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'

export class TemplateReplaceNode extends SerializableInputsNode<
  'TemplateReplace',
  { exec: TypedSocket; template: TypedSocket; obj: TypedSocket },
  { exec: TypedSocket; out: TypedSocket },
  { console: ConsoleControl }
> {
  private result = ''
  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
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
    const { template, obj } = (await this.dataflow.fetchInputs(this.id)) as {
      template?: string[]
      obj?: Record<string, unknown>[]
    }
    const tpl = template?.[0] ?? ''
    const data = obj?.[0] ?? {}
    let missing = false
    // allow spaces around key like {{   test   }}
    this.result = tpl.replace(/{{\s*([^{}]+?)\s*}}/g, (_m, key) => {
      const k = String(key).trim()
      if (k in data) {
        const v = (data as Record<string, unknown>)[k]
        return v !== undefined ? String(v) : ''
      }
      missing = true
      return ''
    })
    this.controls.console.addValue(
      `Deserialized result: ${this.result}`
    )
    this.dataflow.reset(this.id)
    await this.changeStatus(
      this.area,
      missing ? NodeStatus.WARNING : NodeStatus.IDLE
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
