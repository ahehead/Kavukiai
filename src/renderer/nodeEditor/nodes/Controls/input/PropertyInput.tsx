import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { type JSX, useRef, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from 'renderer/components/ui/select'
import { Switch } from 'renderer/components/ui/switch'
import {
  BaseControl,
  type ControlOptions,
  useControlValue,
} from 'renderer/nodeEditor/types'
import { Drag } from 'rete-react-plugin'
import type { ControlJson } from 'shared/JsonType'
import { useStopWheel } from '../../util/useStopWheel'

export type PropertyDefaultValue = string | number | boolean | ''

export type PropertyItem = {
  key: string
  typeStr: 'string' | 'number' | 'boolean'
  required: boolean
  defaultValue: PropertyDefaultValue
}

const DEFAULT_INPUT_PLACEHOLDERS: Record<PropertyItem['typeStr'], string> = {
  string: 'デフォルト値',
  number: '0',
  boolean: 'true / false',
}

const TYPE_OPTIONS: PropertyItem['typeStr'][] = ['string', 'number', 'boolean']

const normalizeDefaultValue = (
  type: PropertyItem['typeStr'],
  value: PropertyDefaultValue
): PropertyDefaultValue => {
  if (type === 'boolean') {
    return typeof value === 'boolean' ? value : false
  }
  if (type === 'number') {
    return typeof value === 'number' ? value : ''
  }
  return typeof value === 'string' ? value : ''
}

export interface PropertyInputParams extends ControlOptions<PropertyItem[]> {
  value?: PropertyItem[]
}

export class PropertyInputControl extends BaseControl<
  PropertyItem[],
  PropertyInputParams
> {
  items: PropertyItem[]

  constructor(params: PropertyInputParams) {
    super(params)
    this.items = params.value ?? []
  }

  getValue(): PropertyItem[] {
    return this.items
  }

  setValue(items: PropertyItem[]): void {
    this.items = items
    this.opts.onChange?.(items)
    this.notify()
  }

  addItem(item: PropertyItem): void {
    const newItems = [...this.items, item]
    this.addHistory(this.items, newItems)
    this.setValue(newItems)
  }

  override toJSON(): ControlJson {
    return {
      data: {
        items: this.items,
        editable: this.opts.editable,
      },
    }
  }

  override setFromJSON({ data }: ControlJson): void {
    const { items, editable } = data as any
    this.items = items
    this.opts.editable = editable
  }
}

export function PropertyInputControlView({
  data,
}: {
  data: PropertyInputControl
}): JSX.Element {
  const { editable } = data.opts
  const [keyStr, setKeyStr] = useState('')
  const [typeStr, setTypeStr] = useState<PropertyItem['typeStr']>('string')
  const items = useControlValue(data)
  // Handlers for item manipulation
  const handleMove = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return
    const newItems = [...items]
      ;[newItems[from], newItems[to]] = [newItems[to], newItems[from]]
    data.addHistory(items, newItems)
    data.setValue(newItems)
  }
  const handleMoveUp = (index: number) => {
    handleMove(index, index - 1)
  }
  const handleMoveDown = (index: number) => {
    handleMove(index, index + 1)
  }
  const handleDelete = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    data.addHistory(items, newItems)
    data.setValue(newItems)
  }
  const updateItem = (
    index: number,
    updater: (item: PropertyItem) => PropertyItem
  ) => {
    const newItems = items.map((item, i) =>
      i === index ? updater(item) : item
    )
    data.addHistory(items, newItems)
    data.setValue(newItems)
  }
  const handleToggleRequired = (index: number, nextRequired: boolean) => {
    updateItem(index, item => {
      if (!editable) return item
      return {
        ...item,
        required: nextRequired,
        defaultValue: nextRequired
          ? normalizeDefaultValue(item.typeStr, item.defaultValue)
          : item.defaultValue,
      }
    })
  }
  const handleTypeChange = (
    index: number,
    nextType: PropertyItem['typeStr']
  ) => {
    updateItem(index, item => {
      if (!editable) return item
      return {
        ...item,
        typeStr: nextType,
        defaultValue: normalizeDefaultValue(nextType, item.defaultValue),
      }
    })
  }
  const handleDefaultChange = (
    index: number,
    value: PropertyDefaultValue
  ) => {
    if (!editable) return
    updateItem(index, item => ({
      ...item,
      defaultValue: value,
    }))
  }
  const handleDefaultNumberChange = (index: number, value: string) => {
    if (!editable) return
    updateItem(index, item => {
      if (value === '') {
        return { ...item, defaultValue: '' }
      }
      const numeric = Number(value)
      return {
        ...item,
        defaultValue: Number.isNaN(numeric) ? '' : numeric,
      }
    })
  }
  const listRef = useRef<HTMLDivElement | null>(null)
  useStopWheel(listRef)

  const handleAdd = (): void => {
    if (!keyStr) return
    // 重複するキーがあれば追加をキャンセル
    if (items.some(item => item.key === keyStr)) return
    const item: PropertyItem = {
      key: keyStr,
      typeStr,
      required: true,
      defaultValue: normalizeDefaultValue(typeStr, ''),
    }
    data.addItem(item)
    setKeyStr('')
  }

  return (
    <Drag.NoDrag>
      <div className="flex flex-1 flex-col gap-1 h-full w-full">
        {/* リスト */}
        <div
          ref={listRef}
          className="flex-1 w-full min-h-0 overflow-y-auto border rounded p-2 bg-node-bg"
        >
          <div className="flex flex-col gap-2 text-sm">
            {items.map((item, idx) => (
              <PropertyItemRow
                key={`${item.key}-${item.typeStr}-${idx}`}
                index={idx}
                item={item}
                editable={editable}
                onTypeChange={handleTypeChange}
                onToggleRequired={handleToggleRequired}
                onDefaultChange={handleDefaultChange}
                onDefaultNumberChange={handleDefaultNumberChange}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onDelete={handleDelete}
                canMoveUp={idx > 0}
                canMoveDown={idx < items.length - 1}
              />
            ))}
          </div>
        </div>
        {/* 新規追加入力 */}
        <div className="shrink-0 grid grid-cols-[1fr_minmax(7rem,max-content)_auto] gap-0.5 place-items-center">
          {/* key入力 */}
          <div className="grid grid-cols-[1fr_auto] place-items-center w-full">
            <input
              type="text"
              value={keyStr}
              placeholder="key*"
              onChange={e => setKeyStr(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded text-sm"
              disabled={!editable}
            />
            :
          </div>
          {/* 型選択 */}
          <Select
            value={typeStr}
            onValueChange={val =>
              editable && setTypeStr(val as PropertyItem['typeStr'])
            }
            disabled={!editable}
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="rounded-0">
              <SelectGroup>
                <SelectLabel>Type</SelectLabel>
                {TYPE_OPTIONS.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* 追加ボタン */}
          <button
            onClick={handleAdd}
            disabled={!editable}
            className="ml-1 w-8 h-8 flex justify-center items-center p-1 rounded border border-input text-sm bg-accent/40 hover:bg-accent/70 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Drag.NoDrag>
  )
}

type PropertyItemRowProps = {
  index: number
  item: PropertyItem
  editable: boolean
  onTypeChange: (index: number, type: PropertyItem['typeStr']) => void
  onToggleRequired: (index: number, nextRequired: boolean) => void
  onDefaultChange: (index: number, value: PropertyDefaultValue) => void
  onDefaultNumberChange: (index: number, value: string) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onDelete: (index: number) => void
  canMoveUp: boolean
  canMoveDown: boolean
}

function PropertyItemRow({
  index,
  item,
  editable,
  onTypeChange,
  onToggleRequired,
  onDefaultChange,
  onDefaultNumberChange,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp,
  canMoveDown,
}: PropertyItemRowProps): JSX.Element {
  const requiredSwitchId = `property-required-${index}`
  const defaultSwitchId = `property-default-${index}`
  const booleanDefault =
    typeof item.defaultValue === 'boolean' ? item.defaultValue : false

  return (
    <div className="rounded border border-border/60 bg-background/60 px-3 py-2">
      <div className="grid grid-cols-[minmax(10rem,1.6fr)_minmax(6rem,1fr)_minmax(6rem,max-content)_minmax(9rem,1.2fr)_auto] items-center gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            key
          </span>
          <span className="text-sm font-medium break-all">{item.key}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            type
          </span>
          <Select
            value={item.typeStr}
            onValueChange={val =>
              onTypeChange(index, val as PropertyItem['typeStr'])
            }
            disabled={!editable}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="rounded-0">
              <SelectGroup>
                <SelectLabel>Type</SelectLabel>
                {TYPE_OPTIONS.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            required
          </span>
          <div className="flex items-center gap-2">
            <Switch
              id={requiredSwitchId}
              checked={item.required}
              onCheckedChange={checked => onToggleRequired(index, checked)}
              disabled={!editable}
            />
            <label
              className="text-xs select-none"
              htmlFor={requiredSwitchId}
            >
              {item.required ? 'required' : 'optional'}
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            default
          </span>
          {item.required ? (
            <div className="flex items-center gap-2">
              {item.typeStr === 'string' && (
                <input
                  type="text"
                  value={
                    typeof item.defaultValue === 'string'
                      ? item.defaultValue
                      : ''
                  }
                  placeholder={DEFAULT_INPUT_PLACEHOLDERS[item.typeStr]}
                  onChange={e => onDefaultChange(index, e.target.value)}
                  className="w-full px-2 py-1 border border-input rounded text-xs"
                  disabled={!editable}
                />
              )}
              {item.typeStr === 'number' && (
                <input
                  type="number"
                  value={
                    item.defaultValue === ''
                      ? ''
                      : String(item.defaultValue)
                  }
                  placeholder={DEFAULT_INPUT_PLACEHOLDERS[item.typeStr]}
                  onChange={e => onDefaultNumberChange(index, e.target.value)}
                  className="w-full px-2 py-1 border border-input rounded text-xs"
                  disabled={!editable}
                />
              )}
              {item.typeStr === 'boolean' && (
                <div className="flex items-center gap-2">
                  <Switch
                    id={defaultSwitchId}
                    checked={booleanDefault}
                    onCheckedChange={checked =>
                      onDefaultChange(index, checked)
                    }
                    disabled={!editable}
                  />
                  <label
                    className="text-xs select-none"
                    htmlFor={defaultSwitchId}
                  >
                    {booleanDefault ? 'true' : 'false'}
                  </label>
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onMoveUp(index)}
            disabled={!editable || !canMoveUp}
            className="p-1 hover:bg-gray-200 disabled:opacity-50"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMoveDown(index)}
            disabled={!editable || !canMoveDown}
            className="p-1 hover:bg-gray-200 disabled:opacity-50"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(index)}
            disabled={!editable}
            className="p-1 hover:bg-gray-200 disabled:opacity-50"
            aria-label={`Remove property ${item.key}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
