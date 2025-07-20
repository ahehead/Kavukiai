import { MultiLineControl } from 'renderer/nodeEditor/nodes/Controls/input/MultiLine'
import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { BaseNode } from 'renderer/nodeEditor/types/Node/BaseNode'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine, DataflowEngine } from 'rete-engine'
import type { HistoryPlugin } from 'rete-history-plugin'
import { resetCacheDataflow } from '../../../util/resetCacheDataflow'

// フォーム入力用文字列ノード
export class StringFormNode extends BaseNode<
  'StringForm',
  { exec: TypedSocket; },
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
      onClick: async () => { this.controlFlow.execute(this.id, 'exec') }
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
          resetCacheDataflow(dataflow, this.id)
        },
      })
    )
  }

  data(): { out: string } {
    return { out: this.controls.textArea.getValue() || '' }
  }

  async execute(): Promise<void> {
    this.controls.textArea.setValue('')
    resetCacheDataflow(this.dataflow, this.id)
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
