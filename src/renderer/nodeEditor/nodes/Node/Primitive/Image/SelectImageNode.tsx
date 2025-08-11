import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { ImageControl } from 'renderer/nodeEditor/nodes/Controls/Image'
import { ImageFileInputControl } from 'renderer/nodeEditor/nodes/Controls/input/ImageFileInput'
import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { BaseNode } from 'renderer/nodeEditor/types/Node/BaseNode'
import type { NodeImage } from 'renderer/nodeEditor/types/Schemas/NodeImage'
import type { AreaPlugin } from 'rete-area-plugin'
import type { HistoryPlugin } from 'rete-history-plugin'

export class SelectImageNode extends BaseNode<
  'SelectImage',
  object,
  { out: TypedSocket },
  { file: ImageFileInputControl; view: ImageControl }
> {
  constructor(
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super('SelectImage')
    this.addOutputPort({ key: 'out', typeName: 'NodeImage', label: 'Image' })

    this.addControl(
      'file',
      new ImageFileInputControl({
        history,
        area,
        onChange: img => {
          this.controls.view.setValue(img ? [img] : [])
          dataflow.reset(this.id)
        },
      })
    )
    this.addControl('view', new ImageControl({ value: [] }))
  }

  data(): { out: NodeImage | null } {
    return { out: this.controls.file.getValue() ?? null }
  }

  async execute(): Promise<void> { }
}
