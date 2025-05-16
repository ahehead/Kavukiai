import { NodeExecSocket } from 'renderer/components/NodePanel'
import type { CustomSocketType } from '../types'

export function CustomExecSocket<T extends CustomSocketType>(
  props: { data: T }
): React.ReactElement {
  const { data } = props

  return (
    <NodeExecSocket title={data.name} isConnected={data.isConnected} />
  )
}
