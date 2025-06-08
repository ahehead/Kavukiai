import { NodeDataSocket } from "renderer/nodeEditor/nodes/components/common/NodeSocketParts"
import type { TypedSocket } from "../../types/TypedSocket"

export function CustomSocket<T extends TypedSocket>(
  props: { data: T }
): React.ReactElement {
  const { name, isConnected } = props.data
  return (
    <NodeDataSocket isConnected={isConnected} title={name} />
  )
}
