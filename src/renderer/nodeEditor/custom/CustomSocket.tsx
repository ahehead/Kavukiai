import type { ClassicPreset } from "rete"

export function CustomSocket<T extends ClassicPreset.Socket>({
  data
}: {
  data: T
}): React.ReactElement {
  return (
    <div className="group cursor-pointer flex socket-icon-wrapper-size rounded-full items-center justify-center">
      <div
        className="
              socket-icon-size
               rounded-full bg-dataSocket
               border-[#686dcc] border-[1px]
               transform transition-all duration-100
               group-hover:scale-115"
        title={data.name}
      />
    </div>
  )
}
