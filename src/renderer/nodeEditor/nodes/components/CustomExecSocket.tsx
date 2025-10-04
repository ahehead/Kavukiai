import { cn } from 'renderer/lib/utils'
import { NodeExecSocket } from 'renderer/nodeEditor/nodes/components/common/NodeSocketParts'
import { useSocketConnection } from 'renderer/nodeEditor/types/Socket/useTypedSocket'
import type { TypedSocket } from '../../types/Socket/TypedSocket'

export function CustomExecSocket<T extends TypedSocket>({
  data,
}: {
  data: T
}): React.ReactElement {
  const isConnected = useSocketConnection(data)
  return (
    <NodeExecSocket
      title={data.name}
      isConnected={isConnected}
      className={cn(
        'group-data-[show-control=true]:fill-white group-data-[show-control=true]:stroke-[var(--execSocket)]',
        isConnected && 'group-data-[show-control=true]:fill-[var(--execSocket)]'
      )}
    />
  )
}
