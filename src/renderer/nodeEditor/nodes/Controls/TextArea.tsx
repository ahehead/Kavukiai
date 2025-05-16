import { useEffect, useRef, useState, type JSX } from "react";
import { ClassicPreset } from "rete";
import type { HistoryPlugin, HistoryAction } from "rete-history-plugin";
import type { AreaExtra, Schemes } from "../../types";
import type { AreaPlugin } from "rete-area-plugin";
import { Drag } from "rete-react-plugin";
import { textAreaClasses } from "renderer/components/NodePanel";
import type { DataflowEngine } from "rete-engine";

// 入力をhistoryプラグインで補足するために、HistoryActionの定義
class TextAreaAction implements HistoryAction {
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
  constructor(
    initial = '',
    public editable = true,
    public nodeId?: string,
    public history?: HistoryPlugin<Schemes>,
    public area?: AreaPlugin<Schemes, AreaExtra>,
    public dataflow?: DataflowEngine<Schemes>,
    public onChange?: (v: string) => void,
  ) {
    super();
    this.value = initial;
  }
  setValue(value: string) {
    this.value = value;
    try {
      //dataflowのキャッシュをクリア
      this.dataflow?.reset()
    } catch (e) {
      console.error("dataNode reset error", e, this.value);
    }
    this.onChange?.(value);
  }
  // 設定用、画面に反映するならarea.update()を呼ぶ
  setEditable(editable: boolean) {
    this.editable = editable;
  }
}


// カスタムコンポーネント
export function TextAreaControllView(props: {
  data: MultiLineControl;
}): JSX.Element {
  const control = props.data;
  const [uiText, setUiText] = useState(control.value);
  const [prevText, setPrevText] = useState(control.value);
  const ref = useRef<HTMLTextAreaElement | null>(null);
  Drag.useNoDrag(ref);
  useEffect(() => {
    setUiText(control.value);
  }, [control.value]);

  const onChangeHandle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    // キー入力ごとに履歴登録
    if (control.history && control.area) control.history.add(new TextAreaAction(control, control.area, uiText, v));
    setUiText(v);
    control.setValue(v);
  }

  return (
    <textarea
      ref={ref}
      value={uiText}
      readOnly={!control.editable}
      onFocus={() => { setPrevText(uiText); }}
      onBlur={() => {
        // 変更確定時に履歴へ登録
        if (uiText !== prevText && control.history && control.area) {
          control.history.add(new TextAreaAction(control, control.area, prevText, uiText));
        }
      }}
      onChange={control.editable ? onChangeHandle : undefined}
      className={textAreaClasses({ editable: control.editable })}
      placeholder=".../"
      rows={1}
      onWheel={(e) => {
        // areaのズームの無効化
        e.stopPropagation();
        e.preventDefault();
      }}
    />
  );
}

