import type { JSX } from "react";
import { Drag } from "rete-react-plugin";
import { inputValueStyles } from "renderer/nodeEditor/nodes/components/common/NodeControlParts";
import type { ControlJson } from "shared/JsonType";
import { BaseControl, useControlValue, type ControlOptions } from "renderer/nodeEditor/types";

export interface InputValueActionParams<T> extends ControlOptions<T> {
  value: T;
  type?: "string" | "number";
  step?: number;
}

// stringまたはnumber入力用コントロール
export class InputValueControl<T extends string | number> extends BaseControl<T, InputValueActionParams<T>> {
  value: T;
  type: "string" | "number";
  step?: number;

  constructor(options: InputValueActionParams<T>) {
    super(options);
    this.value = options.value;
    this.type = options?.type ?? (typeof options.value === "string" ? "string" : "number");
    this.step = options?.step;
  }

  setValue(value: T) {
    this.value = value;
    this.opts.onChange?.(value);
    this.notify();
  }

  getValue(): T {
    return this.value;
  }

  override toJSON(): ControlJson {
    return {
      data: {
        value: this.value,
        type: this.type,
        label: this.opts.label,
        editable: this.opts.editable,
        step: this.step,
      },
    };
  }
  override setFromJSON({ data }: ControlJson): void {
    const { value, type, label, editable, step } = data as any;
    this.value = value;
    this.type = type;
    this.opts.label = label;
    this.opts.editable = editable;
    this.step = step;
    this.notify();
  }
}

// カスタムコンポーネント
export function InputValueControlView<T extends string | number>(props: {
  data: InputValueControl<T>;
}): JSX.Element {
  const control = props.data;
  const value = useControlValue(control);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const newValue = (control.type === "number" ? Number.parseFloat(rawValue) : rawValue) as T;

    control.addHistory(value, newValue)
    control.setValue(newValue);
  };

  return (
    <Drag.NoDrag>
      <div className="w-full">
        <input
          id={control.id}
          type={control.type === "number" ? "number" : "text"}
          step={control.type === "number" ? control.step : undefined}
          value={value}
          readOnly={!control.opts.editable}
          onFocus={() => control.addHistory(value, value)}
          onChange={control.opts.editable ? handleChange : undefined}
          className={inputValueStyles({ editable: control.opts.editable })}
          placeholder=""
        />
      </div>
    </Drag.NoDrag>
  );
}

