import { SerializableInputsNode } from 'renderer/nodeEditor/types'
import { ButtonControl } from '../../Controls/Button'
import { UChatControl } from '../../Controls/Chat/UChat'
import { ImageControl } from '../../Controls/Image'
import { CheckBoxControl } from '../../Controls/input/CheckBox'
import { ImageFileInputControl } from '../../Controls/input/ImageFileInput'
import { ListControl } from '../../Controls/input/List'
import { PathInputControl } from '../../Controls/input/PathInputControl'
import { PropertyInputControl } from '../../Controls/input/PropertyInput'
import { SelectControl } from '../../Controls/input/Select'
import { SliderControl } from '../../Controls/input/Slider'
import { SwitchControl } from '../../Controls/input/Switch'
import { ProgressControl } from '../../Controls/view/ProgressControl'

// src/renderer/nodeEditor/features/customReactPresets/customReactPresets.ts
// コントロール等の確認と、型チェック回避用のNode。
export class TestNode extends SerializableInputsNode<
  'Test',
  object,
  object,
  {
    check: CheckBoxControl
    button: ButtonControl
    select: SelectControl<string>
    list: ListControl<string>
    switch: SwitchControl
    slider: SliderControl
    propertyInput: PropertyInputControl
    image: ImageControl
    imageFileInput: ImageFileInputControl
    progress: ProgressControl
    uChat: UChatControl
    pathInput: PathInputControl
    // コントロールを作った場合まずここに追加
  }
> {
  constructor() {
    super('Test')
    this.addControl(
      'check',
      new CheckBoxControl({ value: true, label: 'CheckBox' })
    )
    this.addControl(
      'button',
      new ButtonControl({ label: 'Button', onClick: async () => { } })
    )
    this.addControl(
      'select',
      new SelectControl({
        value: 'option1',
        optionsList: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
        ],
        label: 'Select Option',
      })
    )
    this.addControl(
      'list',
      new ListControl<string>({
        value: ['item1', 'item2'],
        label: 'List Control',
        editable: true,
      })
    )
    this.addControl(
      'switch',
      new SwitchControl({ value: true, label: 'Switch' })
    )
    this.addControl(
      'slider',
      new SliderControl({
        value: 50,
        label: 'Slider',
        min: 0,
        max: 100,
        step: 1,
      })
    )
    this.addControl(
      'propertyInput',
      new PropertyInputControl({
        value: [{ key: 'example', typeStr: 'string' }],
      })
    )
    this.addControl('image', new ImageControl({ value: [] }))
    this.addControl(
      'imageFileInput',
      new ImageFileInputControl({ value: null })
    )

    this.addControl(
      'progress',
      new ProgressControl({
        value: 0,
        label: 'Progress',
      })
    )

    // Add UChatControl for testing
    this.addControl('uChat', new UChatControl({ value: [], label: 'UChat' }))

    // Add PathInputControl for testing
    this.addControl(
      'pathInput',
      new PathInputControl({
        value: '',
        mode: 'file',
        placeholder: 'ファイルまたはフォルダを選択…',
        title: 'パスを選択',
      })
    )

    // ここに新しいコントロールを追加していく
  }

  data(): object {
    return {}
  }

  async execute(_: never, forward: (output: 'exec') => void): Promise<void> {
    forward('exec')
  }
}
