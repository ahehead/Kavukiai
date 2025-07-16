import { useSyncExternalStore, type JSX } from "react";
import { Drag } from "rete-react-plugin";
import type { ControlJson } from "shared/JsonType";
import { BaseControl, useControlValue, type ControlOptions } from "renderer/nodeEditor/types";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectLabel, SelectGroup } from "renderer/components/ui/select";

export interface SelectControlParams<T> extends ControlOptions<T> {
  value: T;
  optionsList: SelectOption<T>[];
  selectLabel?: string; // Select Menuに表示するラベル
}

export interface SelectOption<T> {
  label: string;
  value: T;
}

export class SelectControl<T> extends BaseControl<T, SelectControlParams<T>> {
  value: T;
  options: SelectOption<T>[];
  selectLabel?: string;

  constructor(params: SelectControlParams<T>) {
    super(params);
    this.value = params.value;
    this.options = params.optionsList;
    this.selectLabel = params.selectLabel;
  }

  getValue(): T {
    return this.value;
  }

  getOptions(): SelectOption<T>[] {
    return this.options;
  }

  setValue(value: T) {
    this.value = value;
    this.opts.onChange?.(value);
    this.notify();
  }

  setValueAndOptions(value: T, options: SelectOption<T>[]) {
    this.value = value;
    this.options = options;
    this.notify();
  }

  override toJSON(): ControlJson {
    return {
      data: {
        value: this.value,
        options: this.options,
        label: this.opts.label,
        editable: this.opts.editable,
      },
    };
  }
  override setFromJSON({ data }: ControlJson): void {
    const { value, options, label, editable } = data as any;
    this.value = value;
    this.options = options;
    this.opts.label = label;
    this.opts.editable = editable;
    this.notify();
  }
}

export function SelectControlView<T>(props: { data: SelectControl<T>; }): JSX.Element {
  const control = props.data;
  const value = useControlValue(control);
  const options = useControlOptions(control);
  const selectLabel = control.selectLabel ?? control.opts.label;
  const { editable, label } = control.opts;

  return (
    <Drag.NoDrag>

      <Select
        value={String(value)}
        onValueChange={(val) => {
          if (editable) {
            const option = options.find(opt => String(opt.value) === val);
            if (option) {
              const oldValue = value;
              const newValue = option.value;
              control.addHistory(oldValue, newValue);
              control.setValue(newValue);
            }
          }
        }}
        disabled={!editable}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {selectLabel && <SelectLabel>{selectLabel}</SelectLabel>}
            {options.map(option => (
              <SelectItem key={String(option.value)} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
            {options.length === 0 && (
              <SelectItem value="0">No options</SelectItem>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Drag.NoDrag>
  );
}

function useControlOptions<T>(control: SelectControl<T>): SelectOption<T>[] {
  return useSyncExternalStore(
    (cb) => control.subscribe(cb),
    () => control.getOptions()
  );
}
