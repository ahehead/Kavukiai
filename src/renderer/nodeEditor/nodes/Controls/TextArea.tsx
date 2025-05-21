import { useEffect, useRef, useState, type JSX } from "react";
import { ClassicPreset } from "rete";
import type { HistoryPlugin, HistoryAction } from "rete-history-plugin";
import type { AreaExtra, Schemes } from "../../types/Schemes";
import type { AreaPlugin } from "rete-area-plugin";
import { Drag } from "rete-react-plugin";
import { textAreaStyles } from "renderer/nodeEditor/component/NodePanel";
import { useStopWheel } from "../util/useStopWheel";

// 入力をhistoryプラグインで補足するために、HistoryActionの定義
export class TextAreaAction implements HistoryAction {
  constructor(
    private control: MultiLineControl,
    private area: AreaPlugin<Schemes, AreaExtra>,
    private prev: string,
    private next: string
  ) { }
  async undo() {
    this.control.setValue(this.prev);
    this.area.update("control", this.control.id)
  }
  async redo() {
    this.control.setValue(this.next);
    this.area.update("control", this.control.id)
  }
}



// 長文プロンプト入力用コントロール
export class MultiLineControl extends ClassicPreset.Control {
  value: string;
  editable: boolean;
  history?: HistoryPlugin<Schemes>;
  area?: AreaPlugin<Schemes, AreaExtra>;
  onChange?: (v: string) => void;

  constructor(
    initial = "",
    options?: {
      editable?: boolean;
      history?: HistoryPlugin<Schemes>;
      area?: AreaPlugin<Schemes, AreaExtra>;
      onChange?: (v: string) => void;
    }
  ) {
    super();
    this.value = initial;
    this.editable = options?.editable ?? true;
    this.history = options?.history;
    this.area = options?.area;
    this.onChange = options?.onChange;
  }
  setValue(value: string) {
    this.value = value;
    this.onChange?.(value);
  }
  setEditable(editable: boolean, isUpdate = false) {
    this.editable = editable;
    if (isUpdate && this.area) {
      this.area.update("control", this.id);
    }
  }
  getValue(): string {
    return this.value;
  }
}


// カスタムコンポーネント
export function TextAreaControllView(props: {
  data: MultiLineControl;
}): JSX.Element {
  const control = props.data;
  const [uiText, setUiText] = useState(control.getValue());
  const [prevText, setPrevText] = useState(control.getValue());
  const ref = useRef<HTMLTextAreaElement | null>(null);
  Drag.useNoDrag(ref);
  useStopWheel(ref);
  useEffect(() => {
    setUiText(control.getValue());
  }, [control.value]);

  const onChangeHandle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    // 履歴登録
    if (control.history && control.area) control.history.add(new TextAreaAction(control, control.area, uiText, newValue));
    setUiText(newValue);
    control.setValue(newValue);
  }


  return (
    <textarea
      ref={ref}
      value={uiText}
      readOnly={!control.editable}
      onFocus={() => { setPrevText(uiText); }}
      onChange={control.editable ? onChangeHandle : undefined}
      className={textAreaStyles({ editable: control.editable })}
      placeholder="..."
      rows={1}
    />
  );
}

