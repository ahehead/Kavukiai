import { NodeExecSocket } from 'renderer/components/NodePanel'
import type { ClassicPreset } from 'rete'

export type ExtraSocketData = {
  isConnectable?: boolean
}

export function CustomExecSocket<T extends ClassicPreset.Socket>(props: {
  data: T & ExtraSocketData
}): React.ReactElement {
  const { data } = props

  return (
    <NodeExecSocket title={data.name} />
  )
}
