import {
  BaseControl,
  type ControlOptions,
  useControlValue,
} from 'renderer/nodeEditor/types'
import type { Image } from 'renderer/nodeEditor/types/Schemas/Util'
import { Drag } from 'rete-react-plugin'
import type { ControlJson } from 'shared/JsonType'

export interface ImageControlOptions extends ControlOptions<Image | null> {
  value?: Image | null
}

export class ImageControl extends BaseControl<
  Image | null,
  ImageControlOptions
> {
  value: Image | null
  constructor(options: ImageControlOptions = {}) {
    super(options)
    this.value = options.value ?? null
  }

  setValue(value: Image | null) {
    this.value = value
    this.notify()
  }

  getValue(): Image | null {
    return this.value
  }

  override toJSON(): ControlJson {
    return { data: { value: this.value } }
  }

  override setFromJSON({ data }: ControlJson): void {
    this.value = (data as any).value ?? null
  }
}

export function ImageControlView(props: { data: ImageControl }) {
  const value = useControlValue(props.data)
  if (!value)
    return (
      <Drag.NoDrag>
        <div className="w-full h-full bg-gray-200" />
      </Drag.NoDrag>
    )
  return (
    <Drag.NoDrag>
      <div className="w-full h-full overflow-hidden flex items-center justify-center">
        <img
          src={value.url}
          alt={value.alt ?? ''}
          className="object-contain w-full h-full"
        />
      </div>
    </Drag.NoDrag>
  )
}
