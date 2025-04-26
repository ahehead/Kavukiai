import { useEffect, useState, type JSX } from "react";
import { ClassicPreset } from "rete";
import { Drag } from "rete-react-plugin";
import type { HistoryPlugin, HistoryAction } from "rete-history-plugin";
import type { AreaExtra, Schemes } from "../../types";
import type { AreaPlugin } from "rete-area-plugin";

// 入力をhistoryプラグインで補足するために、HistoryActionの定義
class TextAreaAction implements HistoryAction {
  constructor(
    private control: MultiLineControl,
    private prev: string,
    private next: string
  ) { }
  async undo() {
    this.control.setValue(this.prev);
    this.control.area?.update("control", this.control.id);
  }
  async redo() {
    this.control.setValue(this.next);
  }
}

// 長文プロンプト入力用コントロール
export class MultiLineControl extends ClassicPreset.Control {
  value: string;
  constructor(
    initial: string,
    public onChange?: (v: string) => void,
    public editable = true,
    public history?: HistoryPlugin<Schemes>,
    public area?: AreaPlugin<Schemes, AreaExtra>
  ) {
    super();
    this.value = initial;
  }
  setValue(value: string) {
    this.value = value;
    this.onChange?.(value);
  }
}

// カスタムコンポーネント
export function TextAreaControllView(props: {
  data: MultiLineControl;
}): JSX.Element {
  const control = props.data;
  const [uiText, setUiText] = useState(control.value);
  const [prevText, setPrevText] = useState(control.value);

  useEffect(() => {
    setUiText(control.value);
  }, [control.value]);

  return (
    <Drag.NoDrag>
      <textarea
        value={uiText}
        readOnly={!control.editable}
        onFocus={() => {
          setPrevText(uiText);
        }}
        onBlur={() => {
          // 変更確定時に履歴へ登録
          if (uiText !== prevText && control.history) {
            control.history.add(
              new TextAreaAction(control, prevText, uiText)
            );
          }
          console.log("blur", uiText);
        }}
        onChange={control.editable ? (e) => {
          const v = e.target.value;
          // キー入力ごとに履歴登録
          if (control.history) {
            control.history.add(
              new TextAreaAction(control, uiText, v)
            );
          }

          setUiText(v);
          control.setValue(v);
        } : undefined}
        className={`resize-none w-full h-full p-2 border-none focus:border-none focus:outline-none ring-1 focus:ring-2 ring-gray-500 rounded-md ${!control.editable ? "cursor-not-allowed" : ""
          }`}
        rows={5}
      />
    </Drag.NoDrag>
  );
}

