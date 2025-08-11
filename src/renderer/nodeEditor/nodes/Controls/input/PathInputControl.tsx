import { electronApiService } from 'renderer/features/services/appService'
import {
  BaseControl,
  type ControlOptions,
  useControlValue,
} from 'renderer/nodeEditor/types'
import { Drag } from 'rete-react-plugin'
import type { ControlJson } from 'shared/JsonType'

export type PathInputMode = 'file' | 'folder' | 'both'

export interface PathInputControlOptions extends ControlOptions<string> {
  value?: string
  mode?: PathInputMode // ファイル/フォルダ/両方
  title?: string
  defaultPath?: string
  filters?: { name: string; extensions: string[] }[] // file/both のときのみ
  placeholder?: string
}

export class PathInputControl extends BaseControl<
  string,
  PathInputControlOptions
> {
  value: string
  private mode: PathInputMode
  private title?: string
  private defaultPath?: string
  private filters?: { name: string; extensions: string[] }[]
  private placeholder?: string

  constructor(options: PathInputControlOptions = {}) {
    super(options)
    this.value = options.value ?? ''
    this.mode = options.mode ?? 'file'
    this.title = options.title
    this.defaultPath = options.defaultPath
    this.filters = options.filters
    this.placeholder = options.placeholder
  }

  getMode(): PathInputMode {
    return this.mode
  }

  getPlaceholder(): string | undefined {
    return this.placeholder
  }

  setValue(value: string) {
    const prev = this.value
    this.value = value
    this.opts.onChange?.(value)
    // 入力エディット経由でも履歴が欲しいケースが多い
    if (prev !== value) this.addHistory(prev, value)
    this.notify()
  }

  getValue(): string {
    return this.value
  }

  override toJSON(): ControlJson {
    return { data: { value: this.value } }
  }

  override setFromJSON({ data }: ControlJson): void {
    this.value = (data as any).value ?? ''
  }

  // ダイアログを開く
  async openDialog(): Promise<void> {
    try {
      const selected = await electronApiService.showOpenPathDialog({
        mode: this.mode,
        title: this.title,
        defaultPath: this.defaultPath || this.value || undefined,
        filters: this.filters,
      })
      if (selected) this.setValue(selected)
    } catch (e) {
      console.error('PathInputControl openDialog error:', e)
    }
  }
}

export function PathInputControlView(props: { data: PathInputControl }) {
  const control = props.data
  const value = useControlValue(control)

  const onChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    control.setValue(e.target.value)
  }

  return (
    <Drag.NoDrag>
      <div className="flex items-center space-x-2 w-full">
        <div className="grid grid-cols-[1fr_auto] items-stretch border border-node-header w-full">
          <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={control.getPlaceholder()}
            disabled={!control.getEditable()}
            className="px-2 py-1 text-sm bg-transparent outline-none disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => control.openDialog()}
            disabled={!control.getEditable()}
            className="cursor-pointer bg-accent/60 px-3 py-1 text-sm font-medium transition-all hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            参照
          </button>
        </div>
      </div>
    </Drag.NoDrag>
  )
}
