import {
  BaseControl,
  type ControlOptions,
  useControlValue,
} from 'renderer/nodeEditor/types'
import type { Image } from 'renderer/nodeEditor/types/Schemas'
import { Drag } from 'rete-react-plugin'
import type { ControlJson } from 'shared/JsonType'

export interface ImageFileInputControlOptions
  extends ControlOptions<Image | null> {
  value?: Image | null
}

export class ImageFileInputControl extends BaseControl<
  Image | null,
  ImageFileInputControlOptions
> {
  value: Image | null
  constructor(options: ImageFileInputControlOptions = {}) {
    super(options)
    this.value = options.value ?? null
  }

  setValue(value: Image | null) {
    this.value = value
    this.opts.onChange?.(value)
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

export function ImageFileInputControlView(props: {
  data: ImageFileInputControl
}) {
  const control = props.data
  const value = useControlValue(control)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      control.setValue(null)
      return
    }
    const url = URL.createObjectURL(file)
    const image: Image = { url, alt: file.name }
    control.addHistory(value, image)
    control.setValue(image)
  }

  return (
    <Drag.NoDrag>
      <div className="flex items-center space-x-2 w-full">
        <div className='grid grid-cols-[auto_1fr] items-stretch border border-node-header w-full'>
          <div className='flex items-center'>
            <label
              htmlFor={control.id}
              className="cursor-pointer rounded bg-accent/60 px-3 py-1 text-sm font-medium transition-all hover:bg-accent/90"
            >
              ファイルを選択
            </label>
            <input
              id={control.id}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </div>
          <div className='flex items-center justify-end px-2'>
            {value ? (
              <span className="text-sm">{value.alt}</span>
            ) : (
              <span className="text-sm text-gray-500">
                ファイルが選択されていません
              </span>
            )}
          </div>
        </div>
      </div>
    </Drag.NoDrag>
  )
}
