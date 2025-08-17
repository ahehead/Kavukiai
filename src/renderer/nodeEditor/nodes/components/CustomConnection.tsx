import { type ClassicScheme, Presets } from 'rete-react-plugin'

const { useConnection } = Presets.classic

export function CustomExecConnection(_props: { data: ClassicScheme['Connection'] }) {
  const { path } = useConnection()
  if (!path) return null
  return (
    <svg className="pointer-events-none overflow-visible absolute">
      {/* 外側アウトライン (黒) */}
      <path
        d={path}
        className="fill-none stroke-black stroke-[7px] opacity-35" // 少し太めにして下地の枠線
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 内側本体 (オレンジ, 半透明) */}
      <path
        d={path}
        className="pointer-events-auto fill-none stroke-[4px] stroke-[#ec923d] opacity-90" // 透明度: 90%
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CustomDataConnection(_props: { data: ClassicScheme['Connection'] }) {
  const { path } = useConnection()
  if (!path) return null
  return (
    <svg className="pointer-events-none overflow-visible absolute">
      {/* 外側アウトライン (黒) */}
      <path
        d={path}
        className="fill-none stroke-black stroke-[7px] opacity-40"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 内側本体 (steelblue, 半透明) */}
      <path
        d={path}
        className="pointer-events-auto fill-none stroke-[4px] stroke-[steelblue] opacity-90"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
