
import type { ClassicPreset } from 'rete'
import TriangleIcon from 'src/resources/public/triangleIcon/triangle.svg?react'


export function CustomExecSocket<T extends ClassicPreset.Socket>(props: {
  data: T
}): React.ReactElement {
  const { data } = props

  return (
    <div className="group inline-flex w-[24px] h-[22px] rounded-full items-center justify-center ml-[1px] mt-[1px] ">
      <div
        className="cursor-pointer
        rounded-full
        transform transition-all duration-100
        group-hover:scale-115"
        title={data.name}
      >
        <TriangleIcon fill="yellow" className="w-[16px] h-[16px]" />
      </div>
    </div>
  )
}
