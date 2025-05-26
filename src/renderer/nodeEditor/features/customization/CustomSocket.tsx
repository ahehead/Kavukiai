import { NodeDataSocket } from "renderer/nodeEditor/component/nodeParts/NodeSocketParts"
import type { TypedSocket } from "../../types/TypedSocket"

export function CustomSocket<T extends TypedSocket>(
  props: { data: T }
): React.ReactElement {
  const { data } = props
  return (
    <NodeDataSocket isConnected={data.isConnected} title={data.name} />
  )
}
