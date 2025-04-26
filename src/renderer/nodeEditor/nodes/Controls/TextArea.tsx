import { useEffect, useState, type JSX } from "react";
import { ClassicPreset } from "rete";
import { Drag } from "rete-react-plugin";


// 長文プロンプト入力用コントロール
export class MultiLineControl extends ClassicPreset.Control {
  value: string;
  constructor(initial: string, public onChange?: (newValue: string) => void, public editable?: boolean) {
    super();
    this.value = initial;
  }
  setValue(value: string): void {
    this.value = value;
    if (this.onChange) {
      this.onChange(value);
    }
  }
}

// 長文テキストエリア用カスタムコンポーネント
export function TextAreaControllView(props: { data: MultiLineControl }): JSX.Element {
  const [uiTextValue, setUiTextValue] = useState(props.data.value);
  const editable = props.data.editable ?? true;

  useEffect(() => {
    setUiTextValue(props.data.value);
  }, [props.data.value]);

  return (
    <Drag.NoDrag>
      <textarea
        value={uiTextValue}
        readOnly={!editable}
        className={`resize-none w-full h-full p-2 border-none focus:border-none focus:outline-none ring-1 focus:ring-2 ring-gray-500 rounded-md ${!editable ? "cursor-not-allowed" : ""
          }`}
        placeholder="..."
        rows={5}
        onChange={editable ? (e) => {
          setUiTextValue(e.target.value)
          props.data.setValue(e.target.value);
        } : undefined}
      />
    </Drag.NoDrag>
  );
}
