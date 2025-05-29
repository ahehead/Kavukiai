import type React from "react"
import { BaseControl, type ControlOptions } from "renderer/nodeEditor/types";
import { Drag } from "rete-react-plugin";

export interface RunButtonControlOptions extends ControlOptions<any> {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

// Run ボタン用コントロール
export class RunButtonControl extends BaseControl<any, RunButtonControlOptions> {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  constructor(opts: RunButtonControlOptions) {
    super(opts);
    this.onClick = opts.onClick ?? (() => { });
  }
  setValue(value: string): void { }
}

// カスタム Run ボタンコンポーネント
export function RunButtonControlView(props: { data: RunButtonControl }) {
  const control = props.data;
  return <RunButton
    label={"Run"}
    onClick={control.onClick}
  />;
}

function RunButton(props: {
  label: string
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}): React.JSX.Element {
  return (
    <Drag.NoDrag>
      <button
        className="relative inline-flex items-center justify-center p-0.5 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white  w-full"
        onClick={props.onClick}
      >
        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-background dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent w-full">
          {props.label}
        </span>
      </button>
    </Drag.NoDrag>
  )
}
