import { NodeDataSocket } from "renderer/nodeEditor/component/nodeParts/NodeSocketParts"
import type { NodeSocket } from "../../types/NodeSocket"

export function CustomSocket<T extends NodeSocket>(
  props: { data: T }
): React.ReactElement {
  const { data } = props
  return (
    <NodeDataSocket isConnected={data.isConnected} title={data.name} />
  )
}
