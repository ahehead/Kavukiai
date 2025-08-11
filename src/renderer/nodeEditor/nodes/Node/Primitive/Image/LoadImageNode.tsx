import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { ImageControl } from 'renderer/nodeEditor/nodes/Controls/Image'
import { ImageFileInputControl } from 'renderer/nodeEditor/nodes/Controls/input/ImageFileInput'
import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { BaseNode } from 'renderer/nodeEditor/types/Node/BaseNode'
import {
  createNodeImageFromUrl,
  type NodeImage,
} from 'renderer/nodeEditor/types/Schemas/NodeImage'
import type { Image } from 'renderer/nodeEditor/types/Schemas/Util'
import type { AreaPlugin } from 'rete-area-plugin'
import type { HistoryPlugin } from 'rete-history-plugin'

export class LoadImageNode extends BaseNode<
  'LoadImage',
  object,
  { out: TypedSocket },
  { file: ImageFileInputControl; view: ImageControl }
> {
  constructor(
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super('LoadImage')
    this.addOutputPort({ key: 'out', typeName: 'NodeImage', label: 'Image' })

    this.addControl(
      'file',
      new ImageFileInputControl({
        history,
        area,
        onChange: img => {
          const ni = img ? createNodeImageFromUrl(img.url, img.alt) : null
          this.controls.view.setValue(ni ? [ni] : [])
          dataflow.reset(this.id)
        },
      })
    )
    this.addControl('view', new ImageControl({ value: [] }))
  }

  data(): { out: NodeImage | null } {
    const f = this.controls.file.getValue()
    return { out: f ? createNodeImageFromUrl(f.url, f.alt) : null }
  }

  async execute(): Promise<void> { }

  serializeControlValue() {
    return {
      data: {
        file: this.controls.file.getValue(),
      },
    }
  }

  deserializeControlValue(data: { file: Image | null }) {
    this.controls.file.setValue(data.file)
    const ni = data.file
      ? createNodeImageFromUrl(data.file.url, data.file.alt)
      : null
    this.controls.view.setValue(ni ? [ni] : [])
  }
}
