import { useEffect, useRef, useState, type JSX, useCallback } from "react";
import { ClassicPreset } from "rete";
import type { HistoryPlugin, HistoryAction } from "rete-history-plugin";
import type { AreaExtra, Schemes } from "../../types/Schemes";
import type { AreaPlugin } from "rete-area-plugin";
import { Drag } from "rete-react-plugin";
import { InputControlLabel, InputControlWrapper } from "renderer/nodeEditor/component/NodePanel";
import type { ControlJson } from "shared/JsonType";
import type { SerializableControl } from "renderer/nodeEditor/types";
import { ChevronDown } from "lucide-react";

// HistoryActionの定義
class SelectValueAction<T> implements HistoryAction {
  constructor(
    private control: SelectControl<T>,
    private area: AreaPlugin<Schemes, AreaExtra>,
    private prev: T,
    private next: T
  ) { }
  async undo() {
    this.control.setValue(this.prev);
    this.area.update("control", this.control.id);
  }
  async redo() {
    this.control.setValue(this.next);
    this.area.update("control", this.control.id);
  }
}

export interface SelectOption<T> {
  label: string;
  value: T;
}

export class SelectControl<T> extends ClassicPreset.Control implements SerializableControl {
  value: T;
  options: SelectOption<T>[];
  label?: string;
  placeholder?: string;
  editable: boolean;
  history?: HistoryPlugin<Schemes>;
  area?: AreaPlugin<Schemes, AreaExtra>;
  onChange?: (v: T) => void;

  constructor(
    initial: T,
    optionsList: SelectOption<T>[],
    options?: {
      label?: string;
      placeholder?: string;
      editable?: boolean;
      history?: HistoryPlugin<Schemes>;
      area?: AreaPlugin<Schemes, AreaExtra>;
      onChange?: (v: T) => void;
    }
  ) {
    super();
    this.value = initial;
    this.options = optionsList;
    this.label = options?.label;
    this.placeholder = options?.placeholder;
    this.editable = options?.editable ?? true;
    this.history = options?.history;
    this.area = options?.area;
    this.onChange = options?.onChange;
  }

  setValue(value: T) {
    this.value = value;
    this.onChange?.(value);
    if (this.area) {
      this.area.update("control", this.id);
    }
  }

  setEditable(editable: boolean) {
    this.editable = editable;
  }

  setHistory(history: HistoryPlugin<Schemes> | undefined) {
    this.history = history;
  }
  setArea(area: AreaPlugin<Schemes, AreaExtra> | undefined) {
    this.area = area;
  }
  setOnChange(onChange: (v: T) => void) {
    this.onChange = onChange;
  }

  getValue(): T {
    return this.value;
  }

  getOptionLabel(value: T): string | undefined {
    return this.options.find(opt => opt.value === value)?.label;
  }

  toJSON(): ControlJson {
    return {
      data: {
        value: this.value,
        options: this.options,
        label: this.label,
        placeholder: this.placeholder,
        editable: this.editable,
      },
    };
  }
  setFromJSON({ data }: ControlJson): void {
    const { value, options, label, placeholder, editable } = data as any;
    this.value = value;
    this.options = options;
    this.label = label;
    this.placeholder = placeholder;
    this.editable = editable;
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
    if (control.editable) {
      const oldValue = currentValue;
      const newValue = option.value;
      if (control.history && control.area) {
        control.history.add(new SelectValueAction(control, control.area, oldValue, newValue));
      }
      control.setValue(newValue);
      setCurrentValue(newValue);
      setIsOpen(false);
    }
  };

  const toggleDropdown = () => {
    if (control.editable) {
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


  const displayLabel = control.getOptionLabel(currentValue) || control.placeholder || "Select...";

  return (
    <InputControlWrapper ref={ref}>
      {control.label && (
        <InputControlLabel htmlFor={control.id}>
          {control.label}
        </InputControlLabel>
      )}
      <div className="relative w-full">
        <button
          id={control.id}
          type="button"
          onClick={toggleDropdown}
          disabled={!control.editable}
          className={`w-full px-2 py-1 text-left bg-input border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 flex justify-between items-center ${control.editable ? 'cursor-default' : ''}`}
        >
          <span className={currentValue === undefined && control.placeholder ? "text-muted-foreground" : ""}>
            {displayLabel}
          </span>
          <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && control.editable && (
          <div
            ref={dropdownRef}
            className="absolute z-10 mt-1 w-full bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto"
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
