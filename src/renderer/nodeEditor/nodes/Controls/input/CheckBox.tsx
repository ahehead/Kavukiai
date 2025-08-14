import type { JSX } from 'react'
import { checkBoxStyles } from 'renderer/nodeEditor/nodes/components/common/NodeControlParts'
import {
  BaseControl,
  type ControlOptions,
  useControlValue,
} from 'renderer/nodeEditor/types'
import { Drag } from 'rete-react-plugin'
import type { ControlJson } from 'shared/JsonType'

export interface CheckBoxControlPrams extends ControlOptions<boolean> {
  value: boolean
}

// boolean入力用コントロール
export class CheckBoxControl extends BaseControl<
  boolean,
  CheckBoxControlPrams
> {
  value: boolean

  constructor(options: CheckBoxControlPrams) {
    super(options)
    this.value = options.value
    this.opts.cols = 2
  }

  setValue(value: boolean) {
    this.value = value
    this.opts.onChange?.(value)
    this.notify()
  }

  getValue(): boolean {
    return this.value
  }

  override toJSON(): ControlJson {
    return {
      data: {
        value: this.value,
        label: this.opts.label,
        editable: this.opts.editable,
      },
    }
  }
  override setFromJSON({ data }: ControlJson): void {
    const { value, label, editable } = data as any
    this.value = value
    this.opts.label = label
    this.opts.editable = editable
  }
}

// カスタムコンポーネント
export function CheckBoxControlView(props: {
  data: CheckBoxControl
}): JSX.Element {
  const control = props.data
  const uiValue = useControlValue(control)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked
    control.addHistory(uiValue, newValue)
    control.setValue(newValue)
  }

  return (
    <Drag.NoDrag>
      <div className="flex justify-center">
        <input
          id={control.id}
          type="checkbox"
          checked={uiValue}
          disabled={!control.opts.editable}
          onChange={control.opts.editable ? handleChange : undefined}
          className={checkBoxStyles({ editable: control.opts.editable })}
        />
      </div>
    </Drag.NoDrag>
  )
}
