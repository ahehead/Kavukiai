import { useEffect, useRef, useState, type JSX, useCallback } from "react";
import { Drag } from "rete-react-plugin";
import { InputControlLabel, InputControlWrapper } from "renderer/nodeEditor/component/nodeParts/NodeControlParts";
import type { ControlJson } from "shared/JsonType";
import { BaseControl, type ControlOptions } from "renderer/nodeEditor/types";
import { ChevronDown } from "lucide-react";

export interface SelectControlParams<T> extends ControlOptions<T> {
  value: T;
  optionsList: SelectOption<T>[];
}

export interface SelectOption<T> {
  label: string;
  value: T;
}

export class SelectControl<T> extends BaseControl<T, SelectControlParams<T>> {
  value: T;
  options: SelectOption<T>[];

  constructor(params: SelectControlParams<T>) {
    super(params);
    this.value = params.value;
    this.options = params.optionsList;
  }

  getValue(): T {
    return this.value;
  }

  setValue(value: T) {
    this.value = value;
    this.opts.onChange?.(value);
    if (this.opts.area) {
      this.opts.area.update("control", this.id);
    }
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

export function SelectControlView<T>(props: {
  data: SelectControl<T>;
}): JSX.Element {
  const control = props.data;
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState<T>(control.getValue());
  const ref = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  Drag.useNoDrag(ref);

  useEffect(() => {
    setCurrentValue(control.getValue());
  }, [control.value]);

  const handleSelect = (option: SelectOption<T>) => {
    if (control.opts.editable) {
      const oldValue = currentValue;
      const newValue = option.value;
      control.addHistory(oldValue, newValue);
      control.setValue(newValue);
      setCurrentValue(newValue);
      setIsOpen(false);
    }
  };

  const toggleDropdown = () => {
    if (control.opts.editable) {
      setIsOpen(!isOpen);
    }
  };

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);


  const displayLabel = control.getOptionLabel(currentValue) || "Select...";

  return (
    <InputControlWrapper ref={ref}>
      {control.opts.label && (
        <InputControlLabel htmlFor={control.id}>
          {control.opts.label}
        </InputControlLabel>
      )}
      <div className="relative w-full">
        <button
          id={control.id}
          type="button"
          onClick={toggleDropdown}
          disabled={!control.opts.editable}
          className={`w-full px-2 py-1 text-left bg-node-bg border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 flex justify-between items-center ${control.opts.editable ? 'cursor-default' : ''}`}
        >
          <span>
            {displayLabel}
          </span>
          <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && control.opts.editable && (
          <div
            ref={dropdownRef}
            className="absolute z-10 mt-1 w-full bg-node-bg border border-border rounded-md shadow-lg max-h-60 overflow-auto"
          >
            <ul className="py-1">
              {control.options.map((option) => (
                // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                <li
                  key={String(option.value)}
                  onClick={() => handleSelect(option)}
                  className="px-3 py-1.5 text-sm cursor-pointer hover:bg-node-accent/50"
                >
                  {option.label}
                </li>
              ))}
              {control.options.length === 0 && (
                <li className="px-3 py-1.5 text-sm text-muted-foreground">
                  No options
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </InputControlWrapper>
  );
}
