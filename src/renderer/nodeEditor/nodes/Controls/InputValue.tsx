import { useEffect, useRef, useState, type JSX } from "react";
import { ClassicPreset } from "rete";
import type { HistoryPlugin, HistoryAction } from "rete-history-plugin";
import type { AreaExtra, Schemes } from "../../types/Schemes";
import type { AreaPlugin } from "rete-area-plugin";
import { Drag } from "rete-react-plugin";
import { InputControlLabel, InputControlWrapper, inputValueStyles } from "renderer/nodeEditor/component/NodePanel";
import type { ControlJson } from "shared/JsonType";
import type { ControlContext, SerializableControl } from "renderer/nodeEditor/types";

// 入力をhistoryプラグインで補足するために、HistoryActionの定義
class InputValueAction<T extends string | number> implements HistoryAction {
  constructor(
    private control: InputValueControl<T>,
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

// stringまたはnumber入力用コントロール
export class InputValueControl<T extends string | number> extends ClassicPreset.Control implements SerializableControl {
  value: T;
  type: "string" | "number";
  label?: string;
  editable: boolean;
  history?: HistoryPlugin<Schemes>;
  area?: AreaPlugin<Schemes, AreaExtra>;
  onChange?: (v: T) => void;
  step?: number;

  constructor(
    initial: T,
    options?: {
      type?: "string" | "number";
      label?: string;
      editable?: boolean;
      history?: HistoryPlugin<Schemes>;
      area?: AreaPlugin<Schemes, AreaExtra>;
      onChange?: (v: T) => void;
      step?: number;
    }
  ) {
    super();
    this.value = initial;
    this.type = options?.type ?? (typeof initial === "string" ? "string" : "number");
    this.label = options?.label;
    this.editable = options?.editable ?? true;
    this.history = options?.history;
    this.area = options?.area;
    this.onChange = options?.onChange;
    this.step = options?.step;
  }

  setValue(value: T) {
    this.value = value;
    this.onChange?.(value);
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

  toJSON(): ControlJson {
    return {
      data: {
        value: this.value,
        type: this.type,
        label: this.label,
        editable: this.editable,
        step: this.step,
      },
    };
  }
  setFromJSON({ data }: ControlJson): void {
    const { value, type, label, editable, step } = data as any;
    this.value = value;
    this.type = type;
    this.label = label;
    this.editable = editable;
    this.step = step;
  }
}

// カスタムコンポーネント
export function InputValueControlView<T extends string | number>(props: {
  data: InputValueControl<T>;
}): JSX.Element {
  const control = props.data;
  const [uiValue, setUiValue] = useState<T>(control.getValue());
  const [prevValue, setPrevValue] = useState<T>(control.getValue());
  const ref = useRef<HTMLInputElement | null>(null);
  Drag.useNoDrag(ref);

  useEffect(() => {
    setUiValue(control.getValue());
  }, [control.value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const newValue = (control.type === "number" ? Number.parseFloat(rawValue) : rawValue) as T;

    if (control.history && control.area) {
      control.history.add(new InputValueAction(control, control.area, uiValue, newValue));
    }
    setUiValue(newValue);
    control.setValue(newValue);
  };

  const handleFocus = () => {
    setPrevValue(uiValue);
  };

  return (
    <InputControlWrapper>
      {control.label && (
        <InputControlLabel htmlFor={control.id}>
          {control.label}
        </InputControlLabel>
      )}
      <input
        id={control.id}
        ref={ref}
        type={control.type === "number" ? "number" : "text"}
        step={control.type === "number" ? control.step : undefined} // step属性を設定
        value={uiValue}
        readOnly={!control.editable}
        onFocus={handleFocus}
        onChange={control.editable ? handleChange : undefined}
        className={inputValueStyles({ editable: control.editable })}
        placeholder="..."
      />
    </InputControlWrapper>
  );
}
