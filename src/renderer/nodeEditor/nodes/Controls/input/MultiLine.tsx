import { Editor } from '@monaco-editor/react'
import type { JSX } from 'react'
import {
  BaseControl,
  type ControlOptions,
  useControlValue,
} from 'renderer/nodeEditor/types'

import type { ControlJson } from 'shared/JsonType'

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

  const onChangeHandle = (value: string | undefined) => {
    const newValue = value ?? ''
    control.addHistory(uiText, newValue) // 履歴登録
    control.setValue(newValue)
  }

  return (
    <div className='w-full h-full border border-input'>
      <Editor
        width="100%"
        height="100%"
        value={uiText}
        theme="vs"
        onChange={control.opts.editable ? onChangeHandle : undefined}
        options={{
          wordWrap: 'on',
          minimap: { enabled: false },
          lineNumbers: 'off',
          glyphMargin: false,
          folding: false,
          renderWhitespace: 'none',
          automaticLayout: true,
          renderLineHighlight: 'none',
          renderLineHighlightOnlyWhenFocus: false,
        }}
      />
    </div>
  )
}
