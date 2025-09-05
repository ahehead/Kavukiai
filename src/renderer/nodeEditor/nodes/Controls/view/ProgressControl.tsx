import type React from 'react'
import { Progress } from 'renderer/components/ui/progress'
import {
  BaseControl,
  type ControlOptions,
  useControlValue,
} from 'renderer/nodeEditor/types/Control/BaseControl'
import { Drag } from 'rete-react-plugin'
import type { ControlJson } from 'shared/JsonType'

export interface ProgressControlParams extends ControlOptions<number> {
  value: number
}

export class ProgressControl extends BaseControl<
  number,
  ProgressControlParams
> {
  value: number
  constructor(opts: ProgressControlParams) {
    super(opts)
    this.value = opts.value
  }

  setValue(value: number): void {
    this.value = value
    this.opts.onChange?.(value)
    this.notify()
  }

  getValue(): number {
    return this.value
  }

  override toJSON(): ControlJson {
    return {
      data: { value: this.value },
    }
  }

  override setFromJSON({ data }: ControlJson): void {
    const { value } = data as any
    this.value = value
    this.notify()
  }
}

export function ProgressControlView(props: {
  data: ProgressControl
}): React.JSX.Element {
  const control = props.data
  const value = useControlValue(control)
  return (
    <Drag.NoDrag>
      <Progress value={value} className="w-full" />
    </Drag.NoDrag>
  )
}
