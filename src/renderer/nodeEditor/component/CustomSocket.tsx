import { NodeDataSocket } from "renderer/components/NodePanel"
import type { CustomSocketType } from "../types"

export function CustomSocket<T extends CustomSocketType>(
  props: { data: T }
): React.ReactElement {
  const { data } = props
  return (
    <NodeDataSocket isConnected={data.isConnected} title={data.name} />
  )
}
