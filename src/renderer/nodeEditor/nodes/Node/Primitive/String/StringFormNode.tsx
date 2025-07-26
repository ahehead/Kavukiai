import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { MultiLineControl } from 'renderer/nodeEditor/nodes/Controls/input/MultiLine'
import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { BaseNode } from 'renderer/nodeEditor/types/Node/BaseNode'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import type { HistoryPlugin } from 'rete-history-plugin'

// フォーム入力用文字列ノード
export class StringFormNode extends BaseNode<
  'StringForm',
  { exec: TypedSocket },
  { out: TypedSocket },
  { textArea: MultiLineControl }
> {
  constructor(
    initial: string,
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlFlow: ControlFlowEngine<Schemes>
  ) {
    super('StringForm')

    // 入力トリガー
    this.addInputPort({
      key: 'exec',
      typeName: 'exec',
      label: 'clear',
      onClick: async () => {
        this.controlFlow.execute(this.id, 'exec')
      },
    })

    // 出力文字列
    this.addOutputPort({
      key: 'out',
      typeName: 'string',
    })

    // マルチライン入力コントロール
    this.addControl(
      'textArea',
      new MultiLineControl({
        value: initial,
        history,
        area,
        onChange: (_v: string) => {
          dataflow.reset(this.id)
        },
      })
    )
  }

  data(): { out: string } {
    return { out: this.controls.textArea.getValue() || '' }
  }

  async execute(): Promise<void> {
    this.controls.textArea.setValue('')
    this.dataflow.reset(this.id)
  }
  serializeControlValue(): { data: { value: string } } {
    return {
      data: { value: this.controls.textArea.getValue() },
    }
  }
  deserializeControlValue(data: { value: string }): void {
    this.controls.textArea.setValue(data.value)
  }
}
