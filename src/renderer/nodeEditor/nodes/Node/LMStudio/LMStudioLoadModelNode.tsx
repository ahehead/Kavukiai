import { electronApiService } from 'renderer/features/services/appService'
import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { NodeStatus } from 'renderer/nodeEditor/types/Node/BaseNode'
import { SerializableInputsNode } from 'renderer/nodeEditor/types/Node/SerializableInputsNode'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine, DataflowEngine } from 'rete-engine'
import type { LMStudioLoadRequestArgs, LMStudioPortEvent } from 'shared/ApiType'
import { ButtonControl } from '../../Controls/Button'
import { ConsoleControl } from '../../Controls/Console'
import { ProgressControl } from '../../Controls/view/ProgressControl'

export class LMStudioLoadModelNode extends SerializableInputsNode<
  'LMStudioLoadModel',
  { exec: TypedSocket; exec2: TypedSocket; modelKey: TypedSocket },
  { exec: TypedSocket },
  { progress: ProgressControl, console: ConsoleControl; }
> {
  port: MessagePort | null = null

  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('LMStudioLoadModel')
    this.addInputPortPattern({
      type: 'RunButton',
      controlflow: this.controlflow,
    })
    this.addInputPort([
      {
        key: 'exec2',
        typeName: 'exec',
        label: 'Cancel',
        control: new ButtonControl({
          label: 'Cancel',
          onClick: e => {
            e.stopPropagation()
            this.controlflow.execute(this.id, 'exec2')
          },
        }),
      },
      { key: 'modelKey', typeName: 'string', tooltip: 'Model key' },
    ])
    this.addOutputPort({ key: 'exec', typeName: 'exec', label: 'Out' })
    this.addControl('progress', new ProgressControl({ value: 0 }))
    this.addControl('console', new ConsoleControl({}))
  }

  data(): object {
    return {}
  }

  async execute(input: 'exec' | 'exec2', forward: (output: 'exec') => void) {
    if (input === 'exec2') return this.stopExecution()
    return this.beginExecution(forward)
  }

  private async stopExecution(): Promise<void> {
    if (this.status === NodeStatus.RUNNING && this.port) {
      this.port.postMessage({ type: 'abort' } as LMStudioPortEvent)
      this.port.close()
      this.port = null
      await this.setStatus(this.area, NodeStatus.IDLE)
      this.controls.console.addValue('Stop')
    } else if (this.status === NodeStatus.RUNNING) {
      await this.setStatus(this.area, NodeStatus.IDLE)
    } else {
      this.controls.console.addValue('Already stopped')
    }
  }

  private async beginExecution(forward: (output: 'exec') => void) {
    if (this.status === NodeStatus.RUNNING) {
      this.controls.console.addValue('Already running')
      return
    }

    await this.setStatus(this.area, NodeStatus.RUNNING)

    const { modelKey } = (await this.dataflow.fetchInputs(this.id)) as {
      modelKey?: string[]
    }

    const key = modelKey?.[0]
    if (!key) {
      await this.logAndTerminate('error', 'No modelKey', forward)
      return
    }

    this.controls.console.addValue(`Load: ${key}`)

    this.port = await createLoadModelPort({ id: this.id, modelKey: key })
    this.port.onmessage = (e: MessageEvent) =>
      this.handlePortMessage(e, forward)
  }

  private async handlePortMessage(
    e: MessageEvent,
    forward: (output: 'exec') => void
  ): Promise<void> {
    const evt = e.data as LMStudioPortEvent
    switch (evt.type) {
      case 'start':
        this.controls.console.addValue('Start')
        break
      case 'progress':
        this.controls.progress.setValue(evt.progress * 100)
        break
      case 'done':
        // set progress to 100% on completion
        this.controls.progress.setValue(100)
        await this.logAndTerminate('done', 'loaded', forward)
        break
      case 'error':
        await this.logAndTerminate('error', evt.message, forward)
        break
    }
  }

  private async logAndTerminate(
    type: 'error' | 'done',
    message: string,
    forward: (output: 'exec') => void
  ) {
    if (type === 'error') {
      this.controls.console.addValue(`Error: ${message}`)
      await this.setStatus(this.area, NodeStatus.ERROR)
    } else {
      this.controls.console.addValue(`Done: ${message}`)
      await this.setStatus(this.area, NodeStatus.COMPLETED)
      forward('exec')
    }
    if (this.port) {
      this.port.close()
      this.port = null
    }
  }

  serializeControlValue() {
    return this.controls.console.toJSON()
  }

  deserializeControlValue(data: any) {
    this.controls.console.setFromJSON({ data })
  }
}

async function createLoadModelPort({
  id,
  modelKey,
}: LMStudioLoadRequestArgs): Promise<MessagePort> {
  return new Promise(resolve => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'node-port' && e.data.id === id) {
        window.removeEventListener('message', handler)
        const [port] = e.ports
        port.start()
        resolve(port)
      }
    }
    window.addEventListener('message', handler)
    electronApiService.loadModel({ id, modelKey })
  })
}
