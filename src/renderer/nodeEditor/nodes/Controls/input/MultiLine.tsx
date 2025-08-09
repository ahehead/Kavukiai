import { type JSX, useRef } from 'react'
import { textAreaStyles } from 'renderer/nodeEditor/nodes/components/common/NodeControlParts'
import {
  BaseControl,
  type ControlOptions,
  useControlValue,
} from 'renderer/nodeEditor/types'
import { Drag } from 'rete-react-plugin'
import type { ControlJson } from 'shared/JsonType'
import { useStopWheel } from '../../util/useStopWheel'

export interface MultiLineControlParams extends ControlOptions<string> {
  value: string
}

// 長文プロンプト入力用コントロール
export class MultiLineControl extends BaseControl<
  string,
  MultiLineControlParams
> {
  value: string
  constructor(params: MultiLineControlParams) {
    super(params)
    this.value = params.value
  }

  getValue(): string {
    return this.value
  }

  setValue(value: string) {
    this.value = value
    this.opts.onChange?.(value)
    this.notify()
  }

  override toJSON(): ControlJson {
    return {
      data: {
        value: this.value,
        editable: this.opts.editable,
      },
    }
  }

  override setFromJSON({ data }: ControlJson): void {
    const { value, editable } = data as any
    this.value = value
    this.opts.editable = editable
  }
}

// カスタムコンポーネント
export function TextAreaControllView(props: {
  data: MultiLineControl
}): JSX.Element {
  const control = props.data
  const uiText = useControlValue(control)
  const ref = useRef<HTMLTextAreaElement | null>(null)

  Drag.useNoDrag(ref) // areaのdragを無効化
  useStopWheel(ref) // テキストエリアでのホイール拡大を無効化

  const onChangeHandle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    control.addHistory(uiText, newValue) // 履歴登録
    control.setValue(newValue)
  }

  return (
    <textarea
      ref={ref}
      value={uiText}
      readOnly={!control.opts.editable}
      // controlをクリック時に、右クリックメニューを閉じるために発火。dataは間違えている。
      onPointerDown={(_e) => control.opts.area?.emit({ type: "nodepicked", data: { id: control.id } })}
      onChange={control.opts.editable ? onChangeHandle : undefined}
      className={textAreaStyles({ editable: control.opts.editable })}
      placeholder="..."
      rows={1}
    />
  )
}
