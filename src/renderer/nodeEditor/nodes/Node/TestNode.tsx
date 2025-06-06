import { ClassicPreset } from 'rete';
import { BaseNode } from "renderer/nodeEditor/types/BaseNode";
import { CheckBoxControl } from '../Controls/input/CheckBox';
import { ButtonControl } from '../Controls/Button';
import { SelectControl } from '../Controls/input/Select';
import { ListControl } from '../Controls/input/List';
import { SwitchControl } from '../Controls/input/Switch';
import { PropertyInputControl } from '../Controls/input/PropertyInput';
import { Type } from '@sinclair/typebox';
const { Output } = ClassicPreset;

// src/renderer/nodeEditor/features/customReactPresets/customReactPresets.ts
// コントロール等の確認と、型チェック回避用のNode。
export class TestNode extends BaseNode<
  object,
  object,
  {
    check: CheckBoxControl,
    button: ButtonControl,
    select: SelectControl<string>,
    list: ListControl<string>,
    switch: SwitchControl,
    propertyInput: PropertyInputControl
    // コントロールを作った場合まずここに追加
  }
> {
  constructor() {
    super('Test');
    this.addControl(
      'check',
      new CheckBoxControl({ value: true, label: 'CheckBox' })
    );
    this.addControl(
      'button',
      new ButtonControl({ label: 'Button', onClick: async () => { } })
    );
    this.addControl(
      'select',
      new SelectControl({
        value: 'option1',
        optionsList: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
        ],
        label: 'Select Option'
      })
    );
    this.addControl(
      'list',
      new ListControl<string>({
        value: ['item1', 'item2'],
        label: 'List Control',
        editable: true
      })
    );
    this.addControl(
      'switch',
      new SwitchControl({ value: true, label: 'Switch' })
    );
    this.addControl(
      'propertyInput',
      new PropertyInputControl({
        value: { key: 'example', typeStr: 'string', type: Type.String() },
      })
    );

    // ここに新しいコントロールを追加していく
  }

  data(): object { return {} }

  async execute(_: never, forward: (output: 'exec') => void): Promise<void> {
    forward('exec');
  }
}
