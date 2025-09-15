import { cva } from 'class-variance-authority'
import { type JSX, useSyncExternalStore } from 'react'
import { cn } from 'renderer/lib/utils'
import { BaseControl, type ControlOptions } from 'renderer/nodeEditor/types'
import { Drag } from 'rete-react-plugin'
import type { ControlJson } from 'shared/JsonType'

export interface SelectStringListParams extends ControlOptions<string | null> {
  items?: string[]
  selected?: string | null
}

export class SelectStringListControl extends BaseControl<
  string | null,
  SelectStringListParams
> {
  private _state: {
    items: string[]
    selected: string | null
    loading: boolean
  } = { items: [], selected: null, loading: false }

  constructor(public params: SelectStringListParams) {
    super(params)
    this._state = {
      ...this._state,
      items: params.items ?? [],
      selected: params.selected ?? null,
    }
  }

  getSelected(): string | null {
    return this._state.selected
  }

  async setItems(result: string[]): Promise<void> {
    const newItems = Array.isArray(result) ? result : []
    const selected =
      this._state.selected && newItems.includes(this._state.selected)
        ? this._state.selected
        : null
    this._state = { ...this._state, loading: false, items: newItems, selected }
    this.notify()
  }

  setLoading() {
    this._state = { ...this._state, loading: true }
    this.notify()
  }

  select(name: string): void {
    const prev = this._state.selected
    this._state = { ...this._state, selected: name }
    if (prev !== name) this.addHistory(prev, name)
    this.params.onChange?.(name)
    this.notify()
  }

  // BaseControl impl
  setValue(v: string | null): void {
    this._state = { ...this._state, selected: v }
    this.notify()
  }

  getValue(): string | null {
    return this._state.selected
  }

  getState() {
    return this._state
  }

  override toJSON(): ControlJson {
    return {
      data: {
        items: this._state.items,
        selected: this._state.selected,
      },
    }
  }
  override setFromJSON({ data }: ControlJson): void {
    const { items, selected } = data as any
    this._state = {
      ...this._state,
      items: Array.isArray(items) ? items : [],
      selected: selected ?? null,
    }
  }
}

export function SelectStringListControlView({
  data,
}: {
  data: SelectStringListControl
}): JSX.Element {
  const state = useSyncExternalStore(
    cb => data.subscribe(cb),
    () => data.getState()
  )

  const listContainerStyles = cva(
    'border rounded p-1 text-xs overflow-auto bg-node-bg flex flex-col gap-0.5 w-full h-full min-w-0 break-words',
    {
      variants: {
        loading: {
          true: 'opacity-60 pointer-events-none',
          false: '',
        },
      },
      defaultVariants: { loading: false },
    }
  )

  const listItemButton = cva(
    'w-full min-w-0 text-left px-2 py-1 rounded cursor-pointer focus:outline-none focus:ring-1 focus:ring-node-accent transition-colors break-words',
    {
      variants: {
        selected: {
          true: 'bg-node-accent/70 shadow-inner hover:bg-node-accent/90',
          false: 'bg-transparent hover:bg-node-accent/40',
        },
      },
      defaultVariants: { selected: false },
    }
  )

  return (
    <Drag.NoDrag>
      <div className="flex flex-col gap-1 w-full h-full">
        <div className={listContainerStyles({ loading: state.loading })}>
          {state.loading && (
            <div className="text-muted-foreground italic px-1 py-0.5">
              Loading...
            </div>
          )}
          {!state.loading && state.items.length === 0 && (
            <div className="text-muted-foreground italic px-1 py-0.5">
              No items
            </div>
          )}
          {!state.loading &&
            state.items.map(it => {
              const selected = state.selected === it
              return (
                <button
                  key={it}
                  type="button"
                  onClick={() => data.select(it)}
                  className={cn(listItemButton({ selected }))}
                >
                  {it}
                </button>
              )
            })}
        </div>
      </div>
    </Drag.NoDrag>
  )
}

