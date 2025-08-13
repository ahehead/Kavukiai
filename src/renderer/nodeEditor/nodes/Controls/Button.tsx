import type React from "react"
import { BaseControl, type ControlOptions } from "renderer/nodeEditor/types/BaseControl";
import { Drag } from "rete-react-plugin";
import type { ControlJson } from "shared/JsonType";

export interface ButtonControlParams extends ControlOptions<any> {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

// ボタン用コントロール
export class ButtonControl extends BaseControl<any, ButtonControlParams> {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  constructor(
    public params: ButtonControlParams
  ) {
    super({ cols: 0, ...params }); // cols:0でラベルを非表示にする
    this.onClick = params.onClick;
  }
  setValue(): void { }
  getValue(): object { return {}; }

  override toJSON(): ControlJson { return {} }
  override setFromJSON(): void { }
}

// カスタム Run ボタンコンポーネント
export function ButtonControlView(props: { data: ButtonControl }) {
  return <Button label={props.data.opts.label ?? ""} onClick={props.data.onClick} />;
}

function Button(props: {
  label: string
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}): React.JSX.Element {
  return (
    <Drag.NoDrag>
      <button
        className="flex items-center justify-center p-1 overflow-hidden text-sm font-medium w-full rounded-lg border-border border-1 hover:bg-accent/50 text-foreground active:bg-accent/90 bg-node-bg"
        onClick={props.onClick}
      >
        {props.label}
      </button>
    </Drag.NoDrag>
  )
}
