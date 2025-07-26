import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { NodeStatus } from 'renderer/nodeEditor/types'
import { SerializableInputsNode } from 'renderer/nodeEditor/types/Node/SerializableInputsNode'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'

export class TemplateReplaceNode extends SerializableInputsNode<
  'TemplateReplace',
  { exec: TypedSocket; template: TypedSocket; obj: TypedSocket },
  { exec: TypedSocket; out: TypedSocket },
  object
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
        typeName: 'exec',
        label: 'In',
        onClick: () => {
          this.controlflow.execute(this.id, 'exec')
        },
      },
      { key: 'template', typeName: 'string', label: 'template' },
      { key: 'obj', typeName: 'object', label: 'object' },
    ])
    this.addOutputPort([
      { key: 'exec', typeName: 'exec', label: 'Out' },
      { key: 'out', typeName: 'string', label: 'out' },
    ])
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
    this.result = tpl.replace(/{{(.*?)}}/g, (_m, key) => {
      if (key in data) {
        const v = (data as Record<string, unknown>)[key]
        return v !== undefined ? String(v) : ''
      }
      missing = true
      return ''
    })
    this.dataflow.reset(this.id)
    await this.setStatus(
      this.area,
      missing ? NodeStatus.WARNING : NodeStatus.IDLE
    )
    await this.area.update('node', this.id)
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
