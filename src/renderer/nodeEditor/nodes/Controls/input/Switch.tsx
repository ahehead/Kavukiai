import type { JSX } from 'react'
import { Switch as UISwitch } from 'renderer/components/ui/switch'
import {
  BaseControl,
  type ControlOptions,
  useControlValue,
} from 'renderer/nodeEditor/types'
import { Drag } from 'rete-react-plugin'
import type { ControlJson } from 'shared/JsonType'

export interface SwitchControlParams extends ControlOptions<boolean> {
  value?: boolean
}

// boolean入力用Switchコントロール
export class SwitchControl extends BaseControl<boolean, SwitchControlParams> {
  value: boolean

  constructor(options: SwitchControlParams) {
    super(options)
    this.value = options.value ?? false
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

export function SwitchControlView(props: { data: SwitchControl }): JSX.Element {
  const control = props.data
  const uiValue = useControlValue(control)

  const handleChange = (checked: boolean) => {
    control.addHistory(uiValue, checked)
    control.setValue(checked)
  }

  return (
    <Drag.NoDrag>
      <div className="flex items-center gap-2">
        <UISwitch
          id={control.id}
          checked={uiValue}
          disabled={!control.opts.editable}
          onCheckedChange={control.opts.editable ? handleChange : undefined}
        />
        <div className="text-sm">{uiValue ? 'true' : 'false'}</div>
      </div>
    </Drag.NoDrag>
  )
}
