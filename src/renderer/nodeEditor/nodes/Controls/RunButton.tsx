import type React from "react"
import type { JSX } from 'react';
import { ClassicPreset } from 'rete';

// Run ボタン用コントロール
export class RunButtonControl extends ClassicPreset.Control {
  constructor(
    public label: string,
    public onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  ) {
    super();
  }
}

// カスタム Run ボタンコンポーネント
export function RunButtonControlView(props: { data: RunButtonControl }): JSX.Element {
  return <RunButton label={props.data.label} onClick={props.data.onClick} />;
}

function RunButton(props: {
  label: string
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}): React.JSX.Element {
  return (
    <button
      className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 w-full"
      onClick={props.onClick}
    >
      <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent w-full">
        {props.label}
      </span>
    </button>
  )
}
