import type { JSX } from "react";
import { ClassicPreset } from "rete";
import RunButton from "./RunButton";
import { StringSocket } from './Sockets';

// String入力ノード用コントロール（テキスト入力）
export class StringNode extends ClassicPreset.Node<
  object,
  { value: ClassicPreset.Socket },
  { textInput: ClassicPreset.InputControl<"text"> }
> {
  constructor() {
    super("String");
    this.addOutput("value", new ClassicPreset.Output(new StringSocket()));
    this.addControl(
      "textInput",
      new ClassicPreset.InputControl("text", { initial: "" })
    );
  }
}

// 長文プロンプト入力ノード用コントロール（テキストエリア）
export class PromptControl extends ClassicPreset.InputControl<"text"> {
  public value: string;
  constructor(initial = "") {
    super("text");
    this.value = initial;
  }
}

// 実行buttonコントロール
export class RunButtonControl extends ClassicPreset.Control {
  constructor(
    public label: string,
    public onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  ) {
    super()
  }
}

export function CustomButton(props: { data: RunButtonControl }): JSX.Element {
  return <RunButton label={props.data.label} onClick={props.data.onClick} />
}
