import { cva, type VariantProps } from 'class-variance-authority'
import type React from 'react'
import {
  BaseControl,
  type ControlOptions,
} from 'renderer/nodeEditor/types/BaseControl'
import { Drag } from 'rete-react-plugin'
import type { ControlJson } from 'shared/JsonType'

export interface ButtonControlParams extends ControlOptions<any> {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  isExec?: boolean
}

// ボタン用コントロール
export class ButtonControl extends BaseControl<any, ButtonControlParams> {
  constructor(public params: ButtonControlParams) {
    super({ cols: 0, ...params }) // cols:0でラベルを非表示にする
  }
  setValue(): void { }
  getValue(): object {
    return {}
  }

  override toJSON(): ControlJson {
    return {}
  }
  override setFromJSON(): void { }
}

// カスタム Run ボタンコンポーネント
export function ButtonControlView({ data: control }: { data: ButtonControl }) {
  return (
    <Button
      label={control.opts.label ?? ''}
      onClick={control.opts.onClick}
      isExec={!!control.opts.isExec}
    />
  )
}

const buttonVariants = cva(
  'flex items-center justify-center p-1 overflow-hidden text-sm font-medium w-full rounded-lg border-1 text-foregroundbg-node-bg transition-colors bg-node-bg',
  {
    variants: {
      exec: {
        false: 'border-border hover:bg-accent/50 active:bg-accent/90 ',
        true: 'border-[var(--execSocket)]/90 hover:bg-node-execSocket-light/50 active:bg-node-execSocket/90',
      },
    },
    defaultVariants: { exec: false },
  }
)

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  label: string
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  isExec?: boolean // エイリアス (exec と同意)
}

function Button(props: ButtonProps): React.JSX.Element {
  const { label, onClick, isExec } = props
  return (
    <Drag.NoDrag>
      <button
        className={buttonVariants({ exec: isExec })}
        onClick={onClick}
        data-exec={isExec ? 'true' : 'false'}
      >
        {label}
      </button>
    </Drag.NoDrag>
  )
}
