import type { ClassicPreset } from 'rete'
import TriangleIcon from 'src/resources/public/triangleIcon/triangle.svg?react'

export type ExtraSocketData = {
  isConnectable?: boolean
}

export function CustomExecSocket<T extends ClassicPreset.Socket>(props: {
  data: T & ExtraSocketData
}): React.ReactElement {
  const { data } = props

  return (
    <div className="group cursor-pointer flex socket-icon-wrapper-size rounded-full items-center justify-center">
      <div
        className="
        rounded-full
        transform transition-all duration-100
        group-hover:scale-115
        "
        title={data.name}
      >
        <TriangleIcon
          className="socket-icon-size
                     fill-[var(--color-execSocket)]
                     stroke-[#f2ffee]"
        />
      </div>
    </div>
  )
}
