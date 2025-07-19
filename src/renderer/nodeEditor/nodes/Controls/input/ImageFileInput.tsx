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
  useBase64?: boolean // option to use base64 for image URL
}

export class ImageFileInputControl extends BaseControl<
  Image | null,
  ImageFileInputControlOptions
> {
  value: Image | null
  private objectUrl: string | null = null
  private useBase64: boolean
  constructor(options: ImageFileInputControlOptions = {}) {
    super(options)
    this.value = options.value ?? null
    this.useBase64 = options.useBase64 ?? false
  }

  /** Get whether to use base64 for image URL */
  public getUseBase64(): boolean {
    return this.useBase64
  }

  /**
   * Track the current object URL for later revocation
   */
  setObjectUrl(url: string | null) {
    this.objectUrl = url
  }

  /**
   * Revoke the current object URL to release resources
   */
  revokeUrl() {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl)
      this.objectUrl = null
    }
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
      control.revokeUrl()
      control.setValue(null)
      return
    }
    // Base64 mode reading
    if (control.getUseBase64()) {
      const reader = new FileReader()
      reader.onload = () => {
        const url = reader.result as string
        const image: Image = { url, alt: file.name }
        control.addHistory(value, image)
        control.setValue(image)
      }
      reader.readAsDataURL(file)
    } else {
      // Blob URL mode
      control.revokeUrl()
      const url = URL.createObjectURL(file)
      control.setObjectUrl(url) // 後で失効させるために保存
      const image: Image = { url, alt: file.name }
      control.addHistory(value, image)
      control.setValue(image)
    }
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
