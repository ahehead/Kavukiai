import type React from "react"
import type { SerializableControl } from "renderer/nodeEditor/types";
import { ClassicPreset } from 'rete';
import { Drag } from "rete-react-plugin";
import type { ControlJson } from "shared/JsonType";

// Run ボタン用コントロール
export class ButtonControl extends ClassicPreset.Control implements SerializableControl {
  constructor(
    public label: string,
    public onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  ) {
    super();
  }
  toJSON(): ControlJson { return { data: { label: this.label } } }
  setFromJSON({ data }: ControlJson): void {
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
        className="flex items-center justify-center p-1 overflow-hidden text-sm font-medium w-full rounded-lg border-border border-1 hover:bg-accent/50 text-foreground active:bg-accent/90"
        onClick={props.onClick}
      >
        {props.label}
      </button>
    </Drag.NoDrag>
  )
}
