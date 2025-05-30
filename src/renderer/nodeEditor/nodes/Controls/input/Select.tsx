import { useEffect, useRef, useState, type JSX } from "react";
import { Drag } from "rete-react-plugin";
import { ControlLabel, ControlWrapper } from "renderer/nodeEditor/component/nodeParts/NodeControlParts";
import type { ControlJson } from "shared/JsonType";
import { BaseControl, type ControlOptions } from "renderer/nodeEditor/types";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectLabel, SelectGroup } from "renderer/components/ui/select";

export interface SelectControlParams<T> extends ControlOptions<T> {
  value: T;
  optionsList: SelectOption<T>[];
  selectLabel?: string;
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

  setValue(value: T) {
    this.value = value;
    this.opts.onChange?.(value);
  }

  getOptionLabel(value: T): string | undefined {
    return this.options.find(opt => opt.value === value)?.label;
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
  }
}

export function SelectControlView<T>(props: { data: SelectControl<T>; }): JSX.Element {
  const control = props.data;
  const selectLabel = control.selectLabel ?? control.opts.label;
  const { editable, label } = control.opts;
  const [selectedValue, setSelectedValue] = useState<T>(control.getValue());
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSelectedValue(control.getValue());
  }, [control.value]);

  return (
    <Drag.NoDrag>
      <ControlWrapper cols={2} ref={ref}>
        {label && (
          <ControlLabel type="checkbox" htmlFor={control.id}>
            {label}
          </ControlLabel>
        )}
        <Select
          value={String(selectedValue)}
          onValueChange={(val) => {
            if (editable) {
              const option = control.options.find(opt => String(opt.value) === val);
              if (option) {
                const oldValue = selectedValue;
                const newValue = option.value;
                control.addHistory(oldValue, newValue);
                control.setValue(newValue);
                setSelectedValue(newValue);
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
              {control.options.map(option => (
                <SelectItem key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
              {control.options.length === 0 && (
                <SelectItem value="">No options</SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </ControlWrapper>
    </Drag.NoDrag>
  );
}
