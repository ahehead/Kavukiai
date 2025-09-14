import { NodeDataSocket } from 'renderer/nodeEditor/nodes/components/common/NodeSocketParts'
import { useSocketConnection } from 'renderer/nodeEditor/types/Socket/useTypedSocket'
import type { TypedSocket } from '../../types/Socket/TypedSocket'

export function CustomSocket<T extends TypedSocket>({
  data,
}: {
  data: T
}): React.ReactElement {
  const { name } = data
  const isConnected = useSocketConnection(data)
  return (
    <NodeDataSocket
      isConnected={isConnected}
      title={name}
      className={'group-data-[show-control=true]:fill-white'}
    />
  )
}
