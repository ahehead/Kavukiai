import { Type } from '@sinclair/typebox'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import {
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'

import type { ControlFlowEngine } from 'rete-engine'
import { SelectControl } from '../../Controls/input/Select'

export class CreateSelectNode extends SerializableInputsNode<
  'CreateSelect',
  { exec: TypedSocket; list: TypedSocket },
  { exec: TypedSocket; out: TypedSocket },
  { select: SelectControl<string> }
> {
  private options: string[] = []

  constructor(
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('CreateSelect')

    this.addInputPort([
      {
        key: 'exec',
        label: 'Generate',
        onClick: () => this.controlflow.execute(this.id, 'exec'),
      },
      {
        key: 'list',
        typeName: 'array',
        label: 'List',
        schema: Type.Array(Type.String()),
      },
    ])

    this.addOutputPort([
      { key: 'exec', typeName: 'exec', label: 'Out' },
      { key: 'out', typeName: 'string', label: 'Selected' },
    ])

    this.addControl(
      'select',
      new SelectControl<string>({
        value: '',
        optionsList: [],
        label: 'select',
        editable: true,
      })
    )
  }

  data(): { out: string } {
    return { out: this.controls.select.getValue() }
  }

  async execute(_: 'exec', forward: (output: 'exec') => void): Promise<void> {
    const { list } = (await this.dataflow.fetchInputs(this.id)) as {
      list?: string[][]
    }
    const options = list?.[0] || []
    if (options.length === 0) {
      return
    }
    this.options = options
    this.controls.select.setValueAndOptions(
      options[0] ?? '',
      options.map(v => ({ label: v, value: v }))
    )
    this.dataflow.reset(this.id)
    forward('exec')
  }

  serializeControlValue(): { data: { value: string; options: string[] } } {
    return {
      data: {
        value: this.controls.select.getValue(),
        options: this.options,
      },
    }
  }

  deserializeControlValue(data: { value: string; options: string[] }): void {
    this.options = data.options
    this.controls.select.options = data.options.map(v => ({
      label: v,
      value: v,
    }))
    this.controls.select.setValue(data.value)
  }
}
