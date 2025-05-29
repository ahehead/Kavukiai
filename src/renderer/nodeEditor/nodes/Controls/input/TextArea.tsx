import { useEffect, useRef, useState, type JSX } from "react";
import { Drag } from "rete-react-plugin";
import { textAreaStyles } from "renderer/nodeEditor/component/nodeParts/NodeControlParts";
import { useStopWheel } from "../../util/useStopWheel";
import { BaseControl, type ControlOptions } from "renderer/nodeEditor/types";
import type { ControlJson } from "shared/JsonType";

export interface MultiLineControlParams extends ControlOptions<string> {
  value: string;
}

// 長文プロンプト入力用コントロール
export class MultiLineControl extends BaseControl<string, MultiLineControlParams> {

  value: string;
  constructor(params: MultiLineControlParams) {
    super(params);
    this.value = params.value;
  }

  getValue(): string {
    return this.value;
  }

  setValue(value: string) {
    this.value = value;
    this.opts.onChange?.(value);
  }

  override toJSON(): ControlJson {
    return {
      data: {
        value: this.value,
        editable: this.opts.editable,
      }
    };
  }

  override setFromJSON({ data }: ControlJson): void {
    const { value, editable } = data as any;
    this.value = value;
    this.opts.editable = editable;
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

  Drag.useNoDrag(ref); // areaのdragを無効化
  useStopWheel(ref); // テキストエリアでのホイール拡大を無効化

  useEffect(() => {
    setUiText(control.getValue());
  }, [control.value]);

  const onChangeHandle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    control.addHistory(uiText, newValue);// 履歴登録
    setUiText(newValue);
    control.setValue(newValue);
  }


  return (
    <textarea
      ref={ref}
      value={uiText}
      readOnly={!control.opts.editable}
      onFocus={() => { setPrevText(uiText); }}
      onChange={control.opts.editable ? onChangeHandle : undefined}
      className={textAreaStyles({ editable: control.opts.editable })}
      placeholder="..."
      rows={1}
    />
  );
}

