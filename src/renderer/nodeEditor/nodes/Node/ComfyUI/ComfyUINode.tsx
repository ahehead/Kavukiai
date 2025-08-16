import { electronApiService } from 'renderer/features/services/appService'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { MessagePortNode } from 'renderer/nodeEditor/types/Node/MessagePortNode'
import type { NodeImageArray } from 'renderer/nodeEditor/types/Schemas/NodeImage'
import { createNodeImageFromBlob, createNodeImageFromUrl } from 'renderer/nodeEditor/types/Schemas/NodeImage'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import type {
  ComfyUIRunRequestArgs,
  PromptRecipe,
  PromptRunOpts,
  WorkflowInputs,
  WorkflowOutputs,
} from 'shared/ComfyUIType'
import type { ComfyUIPortEvent } from 'shared/ComfyUIType/port-events'
import { ConsoleControl } from '../../Controls/Console/Console'
import { ProgressControl } from '../../Controls/view/ProgressControl'

export class ComfyUINode extends MessagePortNode<
  'ComfyUI',
  {
    exec: TypedSocket
    exec2: TypedSocket
    endpoint: TypedSocket
    workflow: TypedSocket
    inputs: TypedSocket
    outputs: TypedSocket
    opts: TypedSocket
    bypass: TypedSocket
  },
  { exec: TypedSocket; images: TypedSocket },
  { progress: ProgressControl; console: ConsoleControl },
  ComfyUIPortEvent,
  ComfyUIRunRequestArgs
> {
  private images: NodeImageArray | null = null

  constructor(
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>,
    protected controlflow: ControlFlowEngine<Schemes>
  ) {
    super('ComfyUI', area, dataflow, controlflow)
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
      { key: 'endpoint', typeName: 'string', label: 'Endpoint', require: true },
      { key: 'workflow', typeName: 'object', label: 'Workflow', require: true },
      { key: 'inputs', typeName: 'WorkflowInputs', label: 'Inputs' },
      { key: 'outputs', typeName: 'WorkflowOutputs', label: 'Outputs' },
      { key: 'opts', typeName: 'PromptRunOpts', label: 'Run Opts' },
      { key: 'bypass', typeName: 'StringArray', label: 'Bypass' },
    ])
    this.addOutputPort([
      { key: 'exec', typeName: 'exec', label: 'Out' },
      { key: 'images', typeName: 'ImageArrayOrNull', label: 'Image' },
    ])
    this.addControl('progress', new ProgressControl({ value: 0 }))
    this.addControl('console', new ConsoleControl({}))
  }

  data(): { images: NodeImageArray | null } {
    return { images: this.images }
  }

  protected async buildRequestArgs(): Promise<ComfyUIRunRequestArgs | null> {
    const [endpoint, workflow, inputs, outputs, opts, bypass] =
      await this.dataflow.fetchInputMultiple<
        [
          string | undefined,
          unknown,
          WorkflowInputs | undefined,
          WorkflowOutputs | undefined,
          PromptRunOpts | undefined,
          string[] | undefined,
        ]
      >(this.id, [
        'endpoint',
        'workflow',
        'inputs',
        'outputs',
        'opts',
        'bypass',
      ])
    this.controls.console.addValue(`Inputs: ${JSON.stringify({ endpoint, workflow, inputs, outputs, opts, bypass }, null, 2)}`);
    // inputs は Optional 化されたため endpoint / workflow のみ必須
    if (!endpoint || !workflow) return null

    const recipe: PromptRecipe = {
      endpoint,
      // runtime では unknown から渡るため any キャスト (schema 側で保証される前提)
      workflow: workflow as any,
      ...(inputs ? { inputs } : {}),
      ...(outputs ? { outputs } : {}),
      ...(opts ? { opts } : {}),
      ...(bypass ? { bypass } : {}),
    }
    return { id: this.id, recipe }
  }

  protected callMain(args: ComfyUIRunRequestArgs): void {
    // preload 経由で postMessage する
    electronApiService.runRecipe(args)
  }

  protected async onPortEvent(
    evt: ComfyUIPortEvent,
    forward: (output: 'exec') => void
  ): Promise<void> {
    switch (evt.type) {
      case 'start':
        this.controls.console.addValue('Start')
        this.controls.progress.setValue(0)
        break
      case 'pending':
        this.controls.console.addValue('Pending')
        break
      case 'progress':
        this.controls.progress.setValue(Math.round((evt.progress ?? 0) * 100))
        if (evt.detail) this.controls.console.addValue(`Progress NodeID: ${evt.detail}`)
        break
      case 'preview':
        this.controls.console.addValue('Preview received')
        break
      case 'output':
        this.controls.console.addValue(`Output: ${evt.key}`)
        break
      case 'finish':
        // 新仕様では finish は完了通知のみ
        this.controls.console.addValue('Finished (awaiting result)')
        break
      case 'result': {
        let imgs: NodeImageArray | null = null
        if ('paths' in evt.result) {
          imgs = evt.result.paths.map((path) => createNodeImageFromUrl(path))
        } else if ('buffers' in evt.result) {
          imgs = evt.result.buffers.map((buffer) => createNodeImageFromBlob(new Blob([buffer])))
        }
        this.images = imgs
        this.dataflow.reset(this.id)
        this.controls.progress.setValue(100)
        await this.logAndTerminate('done', 'result received', forward)
        break
      }
      case 'error':
        await this.logAndTerminate('error', evt.message, forward)
        break
      case 'abort':
        await this.logAndTerminate('error', 'aborted', forward)
        break
    }
  }

  protected onLog(msg: string) {
    this.controls.console.addValue(msg)
  }
}
