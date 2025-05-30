import { useEffect, useState, type JSX } from "react";
import { Drag } from "rete-react-plugin";

import { checkBoxStyles, ControlLabel, ControlWrapper } from "renderer/nodeEditor/component/nodeParts/NodeControlParts";
import { BaseControl, type ControlOptions, } from "renderer/nodeEditor/types";
import type { ControlJson } from "shared/JsonType";

export interface CheckBoxControlPrams extends ControlOptions<boolean> {
  value: boolean;
}

// boolean入力用コントロール
export class CheckBoxControl extends BaseControl<boolean, CheckBoxControlPrams> {
  value: boolean;

  constructor(
    options: CheckBoxControlPrams
  ) {
    super(options);
    this.value = options.value;
  }

  setValue(value: boolean) {
    this.value = value;
    this.opts.onChange?.(value);
  }

  getValue(): boolean {
    return this.value;
  }

  override toJSON(): ControlJson {
    return {
      data: {
        value: this.value,
        label: this.opts.label,
        editable: this.opts.editable,
      },
    };
  }
  override setFromJSON({ data }: ControlJson): void {
    const { value, label, editable } = data as any;
    this.value = value;
    this.opts.label = label;
    this.opts.editable = editable;
  }
}

// カスタムコンポーネント
export function CheckBoxControlView(props: {
  data: CheckBoxControl;
}): JSX.Element {
  const control = props.data;
  const [uiValue, setUiValue] = useState<boolean>(control.getValue());

  useEffect(() => {
    setUiValue(control.getValue());
  }, [control.value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    control.addHistory(uiValue, newValue);
    setUiValue(newValue);
    control.setValue(newValue);
  };

  return (
    <Drag.NoDrag>
      <ControlWrapper cols={2}>
        <ControlLabel type={"checkbox"} htmlFor={control.id}>
          {control.opts.label}
        </ControlLabel>
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
      </ControlWrapper>
    </Drag.NoDrag>
  );
}
