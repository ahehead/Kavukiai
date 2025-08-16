import { cva } from 'class-variance-authority'
import { type JSX, useSyncExternalStore } from 'react'
import { cn } from 'renderer/lib/utils'
import { BaseControl, type ControlOptions } from 'renderer/nodeEditor/types'
import { Drag } from 'rete-react-plugin'
import type { ControlJson } from 'shared/JsonType'

export interface SelectWorkflowControlParams
  extends ControlOptions<string | null> {
  source: 'userData' | 'template'
  items?: string[]
  selected?: string | null
}

export class SelectWorkflowControl extends BaseControl<
  string | null,
  SelectWorkflowControlParams
> {
  source: 'userData' | 'template'
  // 内部状態を一括管理し、変更時に新しいオブジェクト参照を生成して useSyncExternalStore の差分検知を確実にする
  private _state: {
    items: string[]
    selected: string | null
    loading: boolean
    error: string | null
  } = { items: [], selected: null, loading: false, error: null }

  constructor(public params: SelectWorkflowControlParams) {
    super(params)
    this.source = params.source
    this._state = {
      ...this._state,
      items: params.items ?? [],
      selected: params.selected ?? null,
    }
  }

  getSelected(): { source: 'userData' | 'template'; name: string } | null {
    if (!this._state.selected) return null
    return { source: this.source, name: this._state.selected }
  }

  async setItems(result: string[]): Promise<void> {
    // リストのみ更新（エラー状態は触らない）
    const newItems = Array.isArray(result) ? result : []
    const selected =
      this._state.selected && newItems.includes(this._state.selected)
        ? this._state.selected
        : null
    this._state = {
      ...this._state,
      loading: false,
      items: newItems,
      selected,
    }
    this.notify()
  }

  setLoading() {
    this._state = { ...this._state, loading: true, error: null }
    this.notify()
  }
  setError(msg: string) {
    // 既存API（後方互換）
    this._state = { ...this._state, loading: false, error: msg }
    this.notify()
  }

  setErrorMessage(msg: string) {
    // より明示的な名前のエイリアス
    this.setError(msg)
  }

  select(name: string): void {
    this._state = { ...this._state, selected: name }
    this.params.onChange?.(name)
    this.notify()
  }

  // BaseControl 抽象実装
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
        source: this.source,
        items: this._state.items,
        selected: this._state.selected,
      },
    }
  }
  override setFromJSON({ data }: ControlJson): void {
    const { source, items, selected } = data as any
    this.source = source ?? this.source
    this._state = {
      ...this._state,
      items: Array.isArray(items) ? items : [],
      selected: selected ?? null,
    }
  }
}

export function SelectWorkflowControlView({
  data,
}: {
  data: SelectWorkflowControl
}): JSX.Element {
  const state = useSyncExternalStore(
    cb => data.subscribe(cb),
    () => data.getState()
  )

  // cva: list コンテナ
  const listContainerStyles = cva(
    'border rounded p-1 text-xs overflow-auto bg-node-bg flex flex-col gap-0.5',
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

  // cva: ワークフロー項目ボタン
  const workflowItemButton = cva(
    'text-left px-2 py-1 rounded cursor-pointer focus:outline-none focus:ring-1 focus:ring-node-accent transition-colors',
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
      <div className="flex flex-col w-full gap-1 h-full">
        {/* Error message (moved to top) */}
        <div
          className={
            'text-xs min-h-4 transition-colors empty:hidden ' +
            (state.error ? 'text-red-500' : 'text-transparent')
          }
        >
          {state.error}
        </div>
        {/* list */}
        <div className="flex flex-col gap-1 w-full h-full">
          <div className={listContainerStyles({ loading: state.loading })}>
            {state.loading && (
              <div className="text-muted-foreground italic px-1 py-0.5">
                Loading...
              </div>
            )}
            {!state.loading && state.items.length === 0 && (
              <div className="text-muted-foreground italic px-1 py-0.5">
                No workflows
              </div>
            )}
            {!state.loading &&
              state.items.map(it => {
                const selected = state.selected === it
                return (
                  <button
                    key={it}
                    type="button"
                    onClick={() => {
                      const pre = state.selected
                      data.addHistory(pre, it)
                      data.select(it)
                    }}
                    className={cn(workflowItemButton({ selected }))}
                  >
                    {it}
                  </button>
                )
              })}
          </div>
        </div>
      </div>
    </Drag.NoDrag>
  )
}
