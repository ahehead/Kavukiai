import type { ModelInfo } from '@lmstudio/sdk'
import { cva } from 'class-variance-authority'
import { type JSX, useSyncExternalStore } from 'react'
import {
  BaseControl,
  type ControlOptions,
  useControlValue,
} from 'renderer/nodeEditor/types'
import { Drag } from 'rete-react-plugin'
import type { ControlJson } from 'shared/JsonType'

export interface ModelInfoListControlParams
  extends ControlOptions<string | null> {
  list: ModelInfo[]
  selectedKey?: string | null
  selectLabel?: string
}

export class ModelInfoListControl extends BaseControl<
  string | null,
  ModelInfoListControlParams
> {
  private list: ModelInfo[]
  private selectedKey: string | null

  constructor(params: ModelInfoListControlParams) {
    super(params)
    this.list = params.list ?? []
    this.selectedKey = params.selectedKey ?? null
  }

  getValue(): string | null {
    return this.selectedKey
  }

  setValue(value: string | null) {
    this.setSelectedKey(value)
  }

  setList(list: ModelInfo[]) {
    this.list = list
    this.notify()
  }

  setSelectedKey(key: string | null) {
    this.selectedKey = key
    this.opts.onChange?.(this.selectedKey)
    this.notify()
  }

  getList(): ModelInfo[] {
    return this.list
  }

  getSelected(): ModelInfo | null {
    if (!this.selectedKey) return null
    return this.list.find(m => m.modelKey === this.selectedKey) ?? null
  }

  override toJSON(): ControlJson {
    return {
      data: {
        list: this.list,
        selectedKey: this.selectedKey,
        label: this.opts.label,
        editable: this.opts.editable,
        selectLabel: this.opts.selectLabel,
      },
    }
  }

  override setFromJSON({ data }: ControlJson): void {
    const { list, selectedKey, label, editable, selectLabel } = data as any
    this.list = list ?? []
    this.selectedKey = selectedKey ?? null
    this.opts.label = label
    this.opts.editable = editable
    this.opts.selectLabel = selectLabel
    this.notify()
  }
}

export function ModelInfoListControlView(props: {
  data: ModelInfoListControl
}): JSX.Element {
  const control = props.data
  const selectedKey = useControlValue(control)
  const list = useSyncExternalStore(
    cb => control.subscribe(cb),
    () => control.getList()
  )

  const { editable } = control.opts

  const formatSize = (bytes?: number) => {
    if (!bytes && bytes !== 0) return '-'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  // cva でリスト項目のスタイルを定義
  // selected=true の場合にのみ選択状態の色を適用し、それ以外は通常状態
  const modelItemVariants = cva(
    'cursor-pointer rounded-md border px-2 py-1 mb-1 text-sm transition-colors  dark:hover:bg-neutral-800 border-input',
    {
      variants: {
        selected: {
          true: 'bg-blue-300 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
          false: 'bg-node-bg hover:bg-neutral-100',
        },
      },
      defaultVariants: { selected: false },
    }
  )

  return (
    <Drag.NoDrag>
      <div className="w-full h-full overflow-auto border border-input rounded-md p-2">
        {list.length === 0 && (
          <div className="text-xs text-muted-foreground">No models</div>
        )}
        {list.map((mi: ModelInfo) => {
          const isLLM = mi.type === 'llm'
          const typeLabel = isLLM ? 'llm' : (mi.type ?? 'model')
          const maxCtx = mi.maxContextLength
          const vision = isLLM ? mi.vision : undefined
          const tool = isLLM ? mi.trainedForToolUse : undefined
          return (
            // biome-ignore lint/a11y/useAriaPropsSupportedByRole: aria-selected is valid for option-like elements in this context
            // biome-ignore lint/a11y/noStaticElementInteractions: This div acts as a selectable list item and handles click events intentionally.
            // biome-ignore lint/a11y/useKeyWithClickEvents: This div is intentionally clickable for selection in a custom list.
            <div
              key={mi.modelKey}
              className={modelItemVariants({
                selected: mi.modelKey === selectedKey,
              })}
              onClick={() => editable && control.setSelectedKey(mi.modelKey)}
              aria-selected={selectedKey === mi.modelKey}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {mi.displayName ?? mi.modelKey}
                </span>
                <div className="text-xs text-muted-foreground break-all">
                  {mi.modelKey}
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <span className="text-[10px] px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700">
                  {typeLabel}
                </span>
                <span className="text-[10px] px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700">
                  {mi.format}
                </span>
                {typeof maxCtx === 'number' && (
                  <span className="text-[10px] px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700">
                    ctx {maxCtx}
                  </span>
                )}
                {vision !== undefined && (
                  <span className="text-[10px] px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700">
                    vision {vision ? 'on' : 'off'}
                  </span>
                )}
                {tool !== undefined && (
                  <span className="text-[10px] px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700">
                    tool {tool ? 'on' : 'off'}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <span>{mi.architecture ?? '-'}</span>
                <span>{formatSize(mi.sizeBytes)}</span>
              </div>
              {/* 長いパスを省略せず折り返す */}
              <span className="flex-1 break-all">{mi.path}</span>
            </div>
          )
        })}
      </div>
    </Drag.NoDrag>
  )
}
