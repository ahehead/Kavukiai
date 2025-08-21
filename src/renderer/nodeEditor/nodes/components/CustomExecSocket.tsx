import { NodeExecSocket } from 'renderer/nodeEditor/nodes/components/common/NodeSocketParts'
import type { TypedSocket } from "../../types/TypedSocket"

export function CustomExecSocket<T extends TypedSocket>(
  props: { data: T }
): React.ReactElement {
  const { data } = props

  return (
    <NodeExecSocket
      title={data.name}
      isConnected={data.isConnected}
      className={'group-data-[show-control=true]:fill-white group-data-[show-control=true]:stroke-[var(--execSocket)]'} />
  )
}
