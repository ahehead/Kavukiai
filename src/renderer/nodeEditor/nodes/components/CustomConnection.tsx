import { cva, type VariantProps } from 'class-variance-authority'
import type { Connection, NodeInterface } from 'renderer/nodeEditor/types'
import { Presets } from 'rete-react-plugin'

const { useConnection } = Presets.classic

// 内側本体のスタイル: 接続の種類(kind)と状態(state)で色などを変化
const innerPathVariants = cva('pointer-events-auto fill-none stroke-[4px]', {
  variants: {
    kind: {
      exec: 'opacity-90 stroke-[#ec923d]', // 実行ライン: オレンジ強調
      data: 'stroke-dataSocket', // データライン: 既存テーマ色
    },
    state: {
      normal: '',
      'type-error': 'stroke-red-500', // 型エラー時は赤で上書き
    },
  },
  defaultVariants: {
    state: 'normal',
  },
})

type InnerPathVariants = VariantProps<typeof innerPathVariants>

// 共通アウトライン(下地)
function OuterOutline({ d }: { d: string }) {
  return (
    <path
      d={d}
      className="fill-none stroke-black stroke-[7px] opacity-40"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

// ベースコンポーネント: 外側は共通、内側はcvaで色分け
function BaseConnection(props: {
  data: Connection<NodeInterface, NodeInterface>
  kind: NonNullable<InnerPathVariants['kind']>
}) {
  const { path } = useConnection()
  if (!path) return null

  return (
    <svg className="pointer-events-none overflow-visible absolute">
      <OuterOutline d={path} />
      <path
        d={path}
        className={innerPathVariants({
          kind: props.kind,
          state: props.data.state ?? 'normal',
        })}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CustomExecConnection(props: {
  data: Connection<NodeInterface, NodeInterface>
}) {
  return <BaseConnection {...props} kind="exec" />
}

export function CustomDataConnection(props: {
  data: Connection<NodeInterface, NodeInterface>
}) {
  return <BaseConnection {...props} kind="data" />
}
