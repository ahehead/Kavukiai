import { RunButtonControl } from 'renderer/nodeEditor/nodes/Controls/Button/RunButton'
import {
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import type { ControlFlowEngine } from 'rete-engine'

// Run ノード
export class RunNode extends SerializableInputsNode<
  'Run',
  { exec: TypedSocket },
  { exec: TypedSocket },
  { btn: RunButtonControl }
> {
  constructor(private engine: ControlFlowEngine<Schemes>) {
    super('Run')
    this.addInputPort({
      key: 'exec',
      typeName: 'exec',
      label: 'bypass',
    })
    this.addOutputPort({
      key: 'exec',
      typeName: 'exec',
    })

    this.addControl(
      'btn',
      new RunButtonControl({
        onClick: async (e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation()
          this.engine.execute(this.id)
        },
      })
    )
  }

  async execute(_: never, forward: (output: 'exec') => void): Promise<void> {
    forward('exec')
  }
}
