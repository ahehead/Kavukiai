import { useEffect, useRef, useState, type JSX } from "react";
import { ClassicPreset } from "rete";
import type { HistoryPlugin, HistoryAction } from "rete-history-plugin";
import type { AreaExtra, Schemes } from "../../types/Schemes";
import type { AreaPlugin } from "rete-area-plugin";
import { Drag } from "rete-react-plugin";
import { CheckBoxLabel, checkBoxStyles, CheckBoxWrapper } from "renderer/nodeEditor/component/NodePanel";

// HistoryActionの定義
class CheckBoxAction implements HistoryAction {
  constructor(
    private control: CheckBoxControl,
    private area: AreaPlugin<Schemes, AreaExtra>,
    private prev: boolean,
    private next: boolean
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

// boolean入力用コントロール
export class CheckBoxControl extends ClassicPreset.Control {
  value: boolean;
  label: string;
  editable: boolean;
  history?: HistoryPlugin<Schemes>;
  area?: AreaPlugin<Schemes, AreaExtra>;
  onChange?: (v: boolean) => void;

  constructor(
    initial: boolean,
    options: {
      label: string;
      editable?: boolean;
      history?: HistoryPlugin<Schemes>;
      area?: AreaPlugin<Schemes, AreaExtra>;
      onChange?: (v: boolean) => void;
    }
  ) {
    super();
    this.value = initial;
    this.label = options.label;
    this.editable = options?.editable ?? true;
    this.history = options?.history;
    this.area = options?.area;
    this.onChange = options?.onChange;
  }

  setValue(value: boolean) {
    this.value = value;
    this.onChange?.(value);
  }

  setEditable(editable: boolean, isUpdate = false) {
    this.editable = editable;
    if (isUpdate && this.area) {
      this.area.update("control", this.id);
    }
  }

  getValue(): boolean {
    return this.value;
  }
}

// カスタムコンポーネント
export function CheckBoxControlView(props: {
  data: CheckBoxControl;
}): JSX.Element {
  const control = props.data;
  const [uiValue, setUiValue] = useState<boolean>(control.getValue());
  const ref = useRef<HTMLInputElement | null>(null);
  Drag.useNoDrag(ref); // areaのdragを無効化


  useEffect(() => {
    setUiValue(control.getValue());
  }, [control.value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;

    if (control.history && control.area) {
      control.history.add(
        new CheckBoxAction(control, control.area, uiValue, newValue)
      );
    }
    setUiValue(newValue);
    control.setValue(newValue);
  };

  return (
    <CheckBoxWrapper>
      <CheckBoxLabel
        htmlFor={control.id}
      >
        {control.label}
      </CheckBoxLabel>
      <input
        id={control.id}
        ref={ref}
        type="checkbox"
        checked={uiValue}
        disabled={!control.editable}
        onChange={control.editable ? handleChange : undefined}
        className={checkBoxStyles({ editable: control.editable })}
      />
    </CheckBoxWrapper>
  );
}
