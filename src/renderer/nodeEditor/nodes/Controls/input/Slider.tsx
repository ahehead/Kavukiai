import { useEffect, useState, type JSX } from "react";
import { Drag } from "rete-react-plugin";
import type { ControlJson } from "shared/JsonType";
import { BaseControl, useControlValue, type ControlOptions } from "renderer/nodeEditor/types";
import { inputValueStyles } from "renderer/nodeEditor/nodes/components/common/NodeControlParts";
import { UISlider } from "renderer/components/ui/slider";

export interface SliderControlParams extends ControlOptions<number> {
  value: number;
  min?: number;
  max?: number;
  step?: number;
}

export class SliderControl extends BaseControl<number, SliderControlParams> {
  value: number;
  min: number;
  max: number;
  step?: number;

  constructor(params: SliderControlParams) {
    super(params);
    this.value = params.value;
    this.min = params.min ?? 0;
    this.max = params.max ?? 100;
    this.step = params.step ?? 1;
  }

  setValue(value: number) {
    this.value = value;
    this.opts.onChange?.(value);
    this.notify();
  }

  getValue(): number {
    return this.value;
  }

  override toJSON(): ControlJson {
    return {
      data: {
        value: this.value,
        min: this.min,
        max: this.max,
        step: this.step,
        label: this.opts.label,
        editable: this.opts.editable,
      },
    };
  }

  override setFromJSON({ data }: ControlJson): void {
    const { value, min, max, step, label, editable } = data as any;
    this.value = value;
    this.min = min;
    this.max = max;
    this.step = step;
    this.opts.label = label;
    this.opts.editable = editable;
  }
}

export function SliderControlView(props: { data: SliderControl }): JSX.Element {
  const control = props.data;
  const value = useControlValue(control);
  const [inputStr, setInputStr] = useState(String(value));

  useEffect(() => setInputStr(String(value)), [value]);

  const handleSliderChange = (vals: number[]) => {
    const newValue = vals[0];
    control.addHistory(value, newValue);
    control.setValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const newValue = Number.parseFloat(rawValue);
    control.addHistory(value, newValue);
    control.setValue(newValue);
  };

  const commitInput = () => {
    const val = Number.parseFloat(inputStr);
    if (!Number.isNaN(val)) {
      const clamped = Math.min(control.max, Math.max(control.min, val));
      control.addHistory(value, clamped);
      control.setValue(clamped);
    }
  };

  return (
    <Drag.NoDrag>
      <div className="grid grid-cols-[1fr_auto] gap-2 items-center w-full">
        <UISlider
          id={control.id}
          min={control.min}
          max={control.max}
          step={control.step}
          value={[value]}
          onValueChange={control.opts.editable ? handleSliderChange : undefined}
          disabled={!control.opts.editable}
        />
        <input
          type="number"
          className={inputValueStyles({ editable: control.opts.editable })}
          value={inputStr}
          step={control.step}
          onChange={control.opts.editable ? handleInputChange : undefined}
          onBlur={control.opts.editable ? commitInput : undefined}
          disabled={!control.opts.editable}
        />
      </div>
    </Drag.NoDrag>
  );
}
