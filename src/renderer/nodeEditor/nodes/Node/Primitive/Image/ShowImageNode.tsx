import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { ImageControl } from 'renderer/nodeEditor/nodes/Controls/Image'
import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { BaseNode } from 'renderer/nodeEditor/types/Node/BaseNode'
import type { NodeImage } from 'renderer/nodeEditor/types/Schemas/NodeImage'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'

export class ShowImageNode extends BaseNode<
  'ShowImage',
  { exec: TypedSocket; image: TypedSocket },
  object,
  { view: ImageControl }
> {
  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('ShowImage')
    this.addInputPort([
      {
        key: 'exec',
        typeName: 'exec',
        label: 'Show',
        onClick: () => this.controlflow.execute(this.id, 'exec'),
      },
      { key: 'image', typeName: 'NodeImage', label: 'Image' },
    ])
    this.addControl('view', new ImageControl({ value: [] }))
  }

  data(): object {
    return {}
  }

  async execute(): Promise<void> {
    const { image } = (await this.dataflow.fetchInputs(this.id)) as {
      image?: NodeImage[]
    }
    if (image?.[0]) {
      // プレビューを追加
      this.controls.view.show(image[0])
      await this.area.update('control', this.controls.view.id)
    }
  }

  serializeControlValue() {
    // このコントロールは状態をシリアライズしない
    return { data: {} }
  }

  deserializeControlValue(_data: any) {
    // 何もしない（コントロール状態の復元は不要）
  }
}
