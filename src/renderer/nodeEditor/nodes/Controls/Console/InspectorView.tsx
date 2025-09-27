import { Editor } from '@monaco-editor/react'
import type { JSX } from 'react'
import {
  BaseControl,
  type ControlOptions,
  useControlValue,
} from 'renderer/nodeEditor/types'

import type { ControlJson } from 'shared/JsonType'

export interface InspectorViewControlParams extends ControlOptions<string> {
  value: string
}

// 長文プロンプト入力用コントロール
export class InspectorViewControl extends BaseControl<
  string,
  InspectorViewControlParams
> {
  value: string
  constructor(params: InspectorViewControlParams) {
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
      },
    }
  }

  override setFromJSON({ data }: ControlJson): void {
    const { value } = data as any
    this.value = value
  }
}

// カスタムコンポーネント
export function InspectorViewControlView({ data }: {
  data: InspectorViewControl
}): JSX.Element {
  const uiText = useControlValue(data)

  const onChangeHandle = (value: string | undefined) => {
    data.setValue(value ?? '')
  }

  return (
    <div className='inspector-view h-full w-full border border-input/20 bg-gray-100 console-rounded outline-none'>
      <Editor
        width="100%"
        height="100%"
        value={uiText}
        theme="vs"
        wrapperProps={{ 'data-monaco-editor': 'true' }}
        onChange={data.opts.editable ? onChangeHandle : undefined}
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
          scrollbar: { vertical: 'auto', horizontal: 'auto' },
        }}
      />
    </div>
  )
}
