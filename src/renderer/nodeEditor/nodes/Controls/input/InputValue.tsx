import type { JSX } from 'react'
import { inputValueStyles } from 'renderer/nodeEditor/nodes/components/common/NodeControlParts'
import {
  BaseControl,
  type ControlOptions,
  useControlValue,
} from 'renderer/nodeEditor/types'
import { Drag } from 'rete-react-plugin'
import type { ControlJson } from 'shared/JsonType'

export interface InputValueActionParams<T>
  extends ControlOptions<T | undefined> {
  value?: T
  type?: 'string' | 'number'
  step?: number
}

// stringまたはnumber入力用コントロール
export class InputValueControl<T extends string | number> extends BaseControl<
  T | undefined,
  InputValueActionParams<T>
> {
  value: T | undefined
  type: 'string' | 'number'
  step?: number

  constructor(options: InputValueActionParams<T>) {
    super(options)
    this.value = options.value
    const inferredType =
      typeof options.value === 'string'
        ? 'string'
        : typeof options.value === 'number'
          ? 'number'
          : 'string'
    this.type = options?.type ?? inferredType
    this.step = options?.step
  }

  setValue(value: T | undefined) {
    this.value = value
    this.opts.onChange?.(value)
    this.notify()
  }

  getValue(): T | undefined {
    return this.value
  }

  override toJSON(): ControlJson {
    return {
      data: {
        value: this.value,
      },
    }
  }
  override setFromJSON({ data }: ControlJson): void {
    const { value } = data as any
    this.value = value
    this.notify()
  }
}

// カスタムコンポーネント
export function InputValueControlView<T extends string | number>({
  data,
}: {
  data: InputValueControl<T>
}): JSX.Element {
  const value = useControlValue(data)

  const renderedValue =
    value === undefined
      ? ''
      : data.type === 'number'
        ? String(value)
        : (value as string)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    let newValue: T | undefined

    if (data.type === 'number') {
      if (rawValue.trim() === '') {
        newValue = undefined
      } else {
        const parsed = Number.parseFloat(rawValue)
        if (Number.isNaN(parsed)) {
          return
        }
        newValue = parsed as T
      }
    } else {
      newValue = rawValue as T
    }

    data.addHistory(value, newValue)
    data.setValue(newValue)
  }

  return (
    <Drag.NoDrag>
      <div className="w-full">
        <input
          id={data.id}
          type={data.type === 'number' ? 'number' : 'text'}
          step={data.type === 'number' ? data.step : undefined}
          value={renderedValue}
          readOnly={!data.opts.editable}
          onFocus={() => data.addHistory(value, value)}
          onChange={data.opts.editable ? handleChange : undefined}
          className={inputValueStyles({ editable: data.opts.editable })}
          placeholder=""
        />
      </div>
    </Drag.NoDrag>
  )
}
