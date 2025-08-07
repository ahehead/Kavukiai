import { electronApiService } from 'renderer/features/services/appService'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { MessagePortNode } from 'renderer/nodeEditor/types/Node/MessagePortNode'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import type { LMStudioLoadRequestArgs, LMStudioPortEvent } from 'shared/ApiType'
import { ConsoleControl } from '../../Controls/Console'
import { ProgressControl } from '../../Controls/view/ProgressControl'

export class LMStudioLoadModelNode extends MessagePortNode<
  'LMStudioLoadModel',
  { exec: TypedSocket; exec2: TypedSocket; modelKey: TypedSocket },
  { exec: TypedSocket },
  { progress: ProgressControl; console: ConsoleControl },
  LMStudioPortEvent,
  LMStudioLoadRequestArgs
> {
  constructor(
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>,
    protected controlflow: ControlFlowEngine<Schemes>
  ) {
    super('LMStudioLoadModel', area, dataflow, controlflow)

    this.addInputPortPattern({
      type: 'RunButton',
      controlflow: this.controlflow,
    })
    this.addInputPort([
      {
        key: 'exec2',
        typeName: 'exec',
        label: 'Cancel',
        onClick: () => this.controlflow.execute(this.id, 'exec2'),
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

  protected async buildRequestArgs(): Promise<LMStudioLoadRequestArgs | null> {
    const { modelKey } = (await this.dataflow.fetchInputs(this.id)) as {
      modelKey?: string[]
    }
    if (!modelKey || modelKey.length === 0) return null
    return { id: this.id, modelKey: modelKey[0] }
  }

  protected callMain(args: LMStudioLoadRequestArgs): void {
    electronApiService.loadModel(args)
  }

  protected async onPortEvent(
    evt: LMStudioPortEvent,
    forward: (output: 'exec') => void
  ): Promise<void> {
    switch (evt.type) {
      case 'start':
        this.controls.console.addValue('Start')
        break
      case 'progress':
        this.controls.progress.setValue(evt.progress * 100)
        break
      case 'finish':
        // set progress to 100% on completion
        this.controls.progress.setValue(100)
        await this.logAndTerminate('done', 'loaded', forward)
        break
      case 'error':
        await this.logAndTerminate('error', evt.message, forward)
        break
    }
  }

  protected onLog(msg: string) {
    this.controls.console.addValue(msg)
  }

  serializeControlValue() {
    return this.controls.console.toJSON()
  }

  deserializeControlValue(data: any) {
    this.controls.console.setFromJSON({ data })
  }
}
