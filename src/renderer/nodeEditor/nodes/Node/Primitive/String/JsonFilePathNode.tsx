import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { PathInputControl } from 'renderer/nodeEditor/nodes/Controls/input/PathInputControl'
import {
  type AreaExtra,
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import type { AreaPlugin } from 'rete-area-plugin'
import type { HistoryPlugin } from 'rete-history-plugin'

// workflow.json など JSON ファイルパス入力専用ノード
// PathInputControl を内包し、選択ダイアログは JSON ファイル拡張子に限定
export class JsonFilePathNode
  extends SerializableInputsNode<
    'JsonFilePath',
    object,
    { out: TypedSocket },
    { path: PathInputControl }
  > {
  constructor(
    initial: string,
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super('JsonFilePath')

    this.addOutputPort({ key: 'out', typeName: 'string', label: 'path' })

    // JSON ファイル専用設定 (filters固定 / mode=file 固定 / placeholderなど)
    this.addControl(
      'path',
      new PathInputControl({
        value: initial,
        editable: true,
        history,
        area,
        mode: 'file',
        title: 'workflow.json を選択',
        placeholder: 'workflow.json のパス',
        filters: [
          { name: 'JSON', extensions: ['json'] },
          // 将来 workflow 拡張子が増えたらここで追加
        ],
        onChange: () => {
          dataflow.reset(this.id)
        },
      })
    )
  }

  data(): { out: string } {
    return { out: this.controls.path.value || '' }
  }

  serializeControlValue() {
    return this.controls.path.toJSON()
  }

  deserializeControlValue(data: any): void {
    this.controls.path.setFromJSON({ data })
  }
}
