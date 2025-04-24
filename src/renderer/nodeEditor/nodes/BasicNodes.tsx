import type { JSX } from "react";
import { ClassicPreset } from "rete";
import RunButton from "./RunButton";
import { ExecSocket, StringSocket } from './Sockets';
import type { ControlFlowEngine } from "rete-engine";
import type { Schemes } from "../types";

// String入力ノード用コントロール（テキスト入力）
export class StringNode extends ClassicPreset.Node<
  object,
  { out: ClassicPreset.Socket },
  { textInput: ClassicPreset.InputControl<"text"> }
> {
  constructor() {
    super("String");
    this.addOutput("out", new ClassicPreset.Output(new StringSocket(), "string"));
    this.addControl(
      "textInput",
      new ClassicPreset.InputControl("text", { initial: "" })
    );
  }
  data(): { out: string } {
    return { out: this.controls.textInput.value || '' }
  }

  async execute(): Promise<void> { }
}

// 長文プロンプト入力ノード用コントロール（テキストエリア）
export class MultiLineControl extends ClassicPreset.InputControl<"text"> {
  constructor(initial = "") {
    super("text");
    this.value = initial;
  }
}

export class Run extends ClassicPreset.Node<
  object,
  { exec: ClassicPreset.Socket },
  { btn: RunButtonControl }
> {
  constructor(
    private engine: ControlFlowEngine<Schemes>
  ) {
    super('Run')
    this.addOutput('exec', new ClassicPreset.Output(new ExecSocket(), undefined, true))
    this.addControl(
      'btn',
      new RunButtonControl('Run', (e: React.MouseEvent<HTMLButtonElement>) => {
        this.engine.execute(this.id)
        e.stopPropagation()
      })
    )
  }

  data(): object { return {} }

  async execute(_: never, forward: (output: 'exec') => void): Promise<void> {
    forward('exec')
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

export function CustomRunButton(props: { data: RunButtonControl }): JSX.Element {
  return <RunButton label={props.data.label} onClick={props.data.onClick} />
}
