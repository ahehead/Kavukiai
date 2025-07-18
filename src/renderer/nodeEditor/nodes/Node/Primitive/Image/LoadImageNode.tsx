import { ImageControl } from 'renderer/nodeEditor/nodes/Controls/Image'
import { ImageFileInputControl } from 'renderer/nodeEditor/nodes/Controls/input/ImageFileInput'
import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { BaseNode } from 'renderer/nodeEditor/types/Node/BaseNode'
import type { Image } from 'renderer/nodeEditor/types/Schemas'
import type { AreaPlugin } from 'rete-area-plugin'
import type { DataflowEngine } from 'rete-engine'
import type { HistoryPlugin } from 'rete-history-plugin'
import { resetCacheDataflow } from '../../../util/resetCacheDataflow'

export class LoadImageNode extends BaseNode<
  "LoadImage",
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
    this.addOutputPort({ key: 'out', typeName: 'Image', label: 'Image' })

    this.addControl(
      'file',
      new ImageFileInputControl({
        history,
        area,
        onChange: img => {
          this.controls.view.setValue(img)
          resetCacheDataflow(dataflow, this.id)
        },
      })
    )
    this.addControl('view', new ImageControl({ value: null }))
  }

  data(): { out: Image | null } {
    return { out: this.controls.file.getValue() }
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
    this.controls.view.setValue(data.file)
  }
}
