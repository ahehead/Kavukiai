import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { ImageControl } from 'renderer/nodeEditor/nodes/Controls/Image'
import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { BaseNode } from 'renderer/nodeEditor/types/Node/BaseNode'
import type { Image } from 'renderer/nodeEditor/types/Schemas/Util'
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
      { key: 'image', typeName: 'Image', label: 'Image' },
    ])
    this.addControl('view', new ImageControl({ value: null }))
  }

  data(): object {
    return {}
  }

  async execute(): Promise<void> {
    const { image } = (await this.dataflow.fetchInputs(this.id)) as {
      image?: Image[]
    }
    if (image?.[0]) {
      this.controls.view.setValue(image[0])
      await this.area.update('control', this.controls.view.id)
    }
  }

  serializeControlValue() {
    return this.controls.view.toJSON()
  }

  deserializeControlValue(data: any) {
    this.controls.view.setFromJSON({ data })
  }
}
