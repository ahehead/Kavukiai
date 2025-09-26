import { Trash2 } from 'lucide-react'
import type React from 'react'
import {
  BaseControl,
  type ControlOptions,
  useControlValue,
} from 'renderer/nodeEditor/types'
import { Drag } from 'rete-react-plugin'
import type { ControlJson } from 'shared/JsonType'
import { formatValue } from '../../util/formatValue'

export interface ArrayViewControlParams extends ControlOptions<unknown[]> {
  value: unknown[]
}

export class ArrayViewControl extends BaseControl<
  unknown[],
  ArrayViewControlParams
> {
  private items: unknown[]

  constructor(options: ArrayViewControlParams) {
    super({ ...options, editable: options.editable ?? false })
    this.items = Array.isArray(options.value) ? [...options.value] : []
  }

  setValue(value: unknown[]): void {
    const next = Array.isArray(value) ? [...value] : []
    this.updateItems(next)
  }

  pushItem(value: unknown): void {
    const next = [...this.items, value]
    this.updateItems(next)
  }

  removeItem(index: number): void {
    if (index < 0 || index >= this.items.length) return
    const next = this.items.filter((_, itemIndex) => itemIndex !== index)
    this.updateItems(next)
  }

  clear(): void {
    if (this.items.length === 0) return
    this.updateItems([])
  }

  getValue(): unknown[] {
    return this.items
  }

  override toJSON(): ControlJson {
    return {
      data: { items: this.items },
    }
  }

  override setFromJSON({ data }: ControlJson): void {
    const items = Array.isArray((data as any)?.items)
      ? ((data as any).items as unknown[])
      : []
    this.items = [...items]
    this.notify()
  }

  private updateItems(next: unknown[]): void {
    const prev = this.items
    this.items = next
    if (prev !== next) {
      this.addHistory(prev, next)
    }
    this.opts.onChange?.(this.items)
    this.notify()
  }
}

export function ArrayViewControlView(props: {
  data: ArrayViewControl
}): React.JSX.Element {
  const control = props.data
  const items = useControlValue(control)

  return (
    <Drag.NoDrag>
      <div className="flex flex-1 h-full w-full flex-col gap-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="rounded border border-dashed border-gray-300 p-2 text-xs text-gray-500">
            Empty
          </div>
        ) : (
          items.map((item, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: using index is acceptable for static array view
              key={`array-item-${index}`}
              className="relative rounded border border-gray-200 bg-white/70 p-2 shadow-sm"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                {index}
              </div>
              <pre className="mt-1 whitespace-pre-wrap break-words text-xs text-gray-800">
                {formatValue(item)}
              </pre>
              <button
                type="button"
                aria-label="Remove item"
                className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border border-transparent bg-white/80 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                onClick={event => {
                  event.stopPropagation()
                  control.removeItem(index)
                }}
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          ))
        )}
      </div>
    </Drag.NoDrag>
  )
}
