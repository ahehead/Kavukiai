import { NodeExecSocket } from 'renderer/nodeEditor/component/nodeParts/NodeSocketParts'
import type { NodeSocket } from "../../types/NodeSocket"

export function CustomExecSocket<T extends NodeSocket>(
  props: { data: T }
): React.ReactElement {
  const { data } = props

  return (
    <NodeExecSocket title={data.name} isConnected={data.isConnected} />
  )
}
