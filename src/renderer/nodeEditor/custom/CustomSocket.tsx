import type { ClassicPreset } from "rete"

export function CustomSocket<T extends ClassicPreset.Socket>({
  data
}: {
  data: T
}): React.ReactElement {
  return (
    <div className="group inline-flex w-[24px] h-[22px] rounded-full items-center justify-center">
      <div
        className="cursor-pointer
               w-[16px] h-[16px]
               rounded-full bg-dataSocket
               border-[#686dcc] border-[1px]
               transform transition-all duration-100
               group-hover:scale-115"
        title={data.name}
      />
    </div>
  )
}
