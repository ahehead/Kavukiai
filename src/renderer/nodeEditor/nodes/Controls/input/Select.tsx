import { useEffect, useRef, useState, type JSX, useCallback } from "react";
import { Drag } from "rete-react-plugin";
import { ControlLabel, ControlWrapper } from "renderer/nodeEditor/component/nodeParts/NodeControlParts";
import { selectTriggerStyles, selectIconStyles, dropdownStyles, dropdownListStyles, dropdownItemStyles, noOptionsStyles } from "renderer/nodeEditor/component/nodeParts/NodeControlParts";
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
  const { editable, label } = control.opts;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<T>(control.getValue());
  const ref = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSelectedValue(control.getValue());
  }, [control.value]);

  const handleSelect = (option: SelectOption<T>) => {
    if (editable) {
      const oldValue = selectedValue;
      const newValue = option.value;
      control.addHistory(oldValue, newValue);
      control.setValue(newValue);
      setSelectedValue(newValue);
      setIsOpen(false);
    }
  };

  const toggleDropdown = () => {
    if (editable) {
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


  const displayLabel = control.getOptionLabel(selectedValue) ?? "Select...";

  return (
    <Drag.NoDrag>
      <ControlWrapper cols={2} ref={ref}>
        {label && (
          <ControlLabel type="checkbox" htmlFor={control.id}>
            {label}
          </ControlLabel>
        )}
        <div className="relative w-full">
          <button
            id={control.id}
            type="button"
            onClick={toggleDropdown}
            disabled={!editable}
            className={selectTriggerStyles({ editable })}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            {displayLabel}
            <ChevronDown className={selectIconStyles({ open: isOpen })} />
          </button>
          {isOpen && editable && (
            <div ref={dropdownRef} className={dropdownStyles()}>
              <ul className={dropdownListStyles()}>
                {control.options.map((option) => (
                  // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                  <li
                    key={String(option.value)}
                    aria-selected={String(option.value) === String(selectedValue)}
                    onClick={() => handleSelect(option)}
                    className={dropdownItemStyles()}
                  >
                    {option.label}
                  </li>
                ))}
                {control.options.length === 0 && (
                  <li className={noOptionsStyles()}>
                    No options
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </ControlWrapper>
    </Drag.NoDrag>
  );
}
