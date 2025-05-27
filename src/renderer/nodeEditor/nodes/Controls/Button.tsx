import type React from "react"
import { BaseControl } from "renderer/nodeEditor/types";
import { Drag } from "rete-react-plugin";
import type { ControlJson } from "shared/JsonType";

// Run ボタン用コントロール
export class ButtonControl extends BaseControl {
  constructor(
    public label: string,
    public onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  ) {
    super();
  }
  override toJSON(): ControlJson { return { data: { label: this.label } } }
  override setFromJSON({ data }: ControlJson): void {
    const { label } = data as any;
    this.label = label;
  }
}

// カスタム Run ボタンコンポーネント
export function ButtonControlView(props: { data: ButtonControl }) {
  return <Button label={props.data.label} onClick={props.data.onClick} />;
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
