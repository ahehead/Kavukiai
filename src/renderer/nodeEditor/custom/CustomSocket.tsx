import { NodeDataSocket } from "renderer/components/NodePanel"
import type { ClassicPreset } from "rete"

export function CustomSocket<T extends ClassicPreset.Socket>({
  data
}: {
  data: T
}): React.ReactElement {
  return (
    <NodeDataSocket title={data.name} />
  )
}
