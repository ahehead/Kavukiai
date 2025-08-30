import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { ImageControl } from 'renderer/nodeEditor/nodes/Controls/view/Image'
import {
  type AreaExtra,
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'

import type { NodeImage, NodeImageOrArrayOrNull } from 'renderer/nodeEditor/types/Schemas/NodeImage'
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
        label: 'Show',
        onClick: () => this.controlflow.execute(this.id, 'exec'),
      },
      { key: 'image', typeName: 'NodeImageOrArrayOrNull', label: 'Image(s)' },
    ])
    this.addControl('view', new ImageControl({ value: [] }))
  }

  async execute(): Promise<void> {
    // NodeImage | NodeImage[] | null を受け取る
    const incoming = await this.dataflow.fetchInputSingle<NodeImageOrArrayOrNull>(
      this.id,
      'image'
    )

    if (!incoming) return

    const list: NodeImage[] = Array.isArray(incoming) ? incoming : [incoming]
    this.controls.view.setValue(list)
    await this.area.update('control', this.controls.view.id)
  }
}
