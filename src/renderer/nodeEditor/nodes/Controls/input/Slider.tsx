import { useEffect, useState, type JSX } from "react";
import { Drag } from "rete-react-plugin";
import { Slider as UISlider } from "renderer/components/ui/slider";
import type { ControlJson } from "shared/JsonType";
import { BaseControl, type ControlOptions } from "renderer/nodeEditor/types";
import { inputValueStyles } from "renderer/nodeEditor/nodes/components/common/NodeControlParts";

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
  const [uiValue, setUiValue] = useState<number>(() => control.getValue());
  const [inputStr, setInputStr] = useState<string>(() => String(control.getValue()));

  useEffect(() => {
    setUiValue(control.getValue());
    setInputStr(String(control.getValue()));
  }, [control.value]);

  const handleSliderChange = (vals: number[]) => {
    const newValue = vals[0];
    control.addHistory(uiValue, newValue);
    setUiValue(newValue);
    setInputStr(String(newValue));
    control.setValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputStr(e.target.value);
  };

  const commitInput = () => {
    const val = Number.parseFloat(inputStr);
    if (!Number.isNaN(val)) {
      const clamped = Math.min(control.max, Math.max(control.min, val));
      control.addHistory(uiValue, clamped);
      setUiValue(clamped);
      setInputStr(String(clamped));
      control.setValue(clamped);
    } else {
      setInputStr(String(uiValue));
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
          value={[uiValue]}
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
          disabled={!control.opts.editable}
        />
      </div>
    </Drag.NoDrag>
  );
}
