import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { ImageControl } from 'renderer/nodeEditor/nodes/Controls/Image'
import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { SerializableInputsNode } from 'renderer/nodeEditor/types/Node/SerializableInputsNode'
import type { NodeImage } from 'renderer/nodeEditor/types/Schemas/NodeImage'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'

export class ShowImageNode extends SerializableInputsNode<
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
    const image = (await this.dataflow.fetchInputSingle<NodeImage>(this.id, "image"))
    if (image) {
      // プレビューを追加
      this.controls.view.show(image)
      await this.area.update('control', this.controls.view.id)
    }
  }

}
