import type React from "react"
import { BaseControl, type ControlOptions } from "renderer/nodeEditor/types/Control/BaseControl";
import { Drag } from "rete-react-plugin";

export interface RunButtonControlOptions extends ControlOptions<any> {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

// Run ボタン用コントロール
export class RunButtonControl extends BaseControl<any, RunButtonControlOptions> {
  setValue(_value: object): void { }
  getValue(): object { return {}; }
}

// カスタム Run ボタンコンポーネント
export function RunButtonControlView({ data: control }: { data: RunButtonControl }) {
  return <RunButton
    label={"Run"}
    onClick={control.opts.onClick ?? (() => { })}
  />;
}

function RunButton(props: {
  label: string
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}): React.JSX.Element {
  return (
    <Drag.NoDrag>
      <button
        className="relative inline-flex items-center justify-center p-0.5 me-2 overflow-hidden text-sm font-bold text-node-fg rounded-lg group bg-gradient-to-br from-node-execSocket to-dataSocket w-full drop-shadow-md  active:drop-shadow-none -translate-y-1 active:translate-y-0 transform-gpu transition-all duration-100 ease-out"
        onClick={props.onClick}
      >
        <span className="relative px-5 py-2.5 bg-background rounded-md w-full hover:bg-node-execSocket-lightgroup-active:bg-node-execSocket-light">
          {props.label}
        </span>
      </button>
    </Drag.NoDrag>
  )
}
