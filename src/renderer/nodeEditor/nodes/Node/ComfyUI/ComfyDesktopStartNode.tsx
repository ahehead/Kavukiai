import { electronApiService } from 'renderer/features/services/appService'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import {
  type AreaExtra,
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import { NodeStatus } from 'renderer/nodeEditor/types/Node/BaseNode'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import type { LaunchOpts } from 'shared/ComfyUIType'
import { ConsoleControl } from '../../Controls/Console/Console'
import { CheckBoxControl } from '../../Controls/input/CheckBox'
import { InputValueControl } from '../../Controls/input/InputValue'
import { PathInputControl } from '../../Controls/input/PathInputControl'

export class ComfyDesktopStartNode extends SerializableInputsNode<
  'ComfyDesktopStart',
  {
    exec: TypedSocket
    appPath: TypedSocket
    port: TypedSocket
    timeoutMs: TypedSocket
    autoDetect: TypedSocket
  },
  { exec: TypedSocket },
  { console: ConsoleControl; appPath: PathInputControl }
> {
  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('ComfyDesktopStart')
    this.addInputPort({
      key: 'exec',
      typeName: 'exec',
      label: 'Start',
      onClick: () => this.controlflow.execute(this.id, 'exec'),
      tooltip: 'Start ComfyUI Desktop',
    })
    // appPath (string, control)
    this.addInputPort({
      key: 'appPath',
      typeName: 'string',
      label: 'appPath',
      showControl: false,
      control: new PathInputControl({
        placeholder: 'auto detect (.exe/.app)',
        mode: 'file',
        title: 'ComfyUI Desktop 実行ファイルを選択',
        filters: [{ name: 'Executable', extensions: ['exe', 'app'] }],
        editable: true,
      }),
    })
    // port (number)
    this.addInputPort({
      key: 'port',
      typeName: 'number',
      label: 'port',
      showControl: false,
      control: new InputValueControl<number>({
        value: 8000,
        type: 'number',
        label: 'port',
        editable: true,
      }),
    })
    // timeoutMs (number)
    this.addInputPort({
      key: 'timeoutMs',
      typeName: 'number',
      label: 'timeoutMs',
      showControl: false,
      control: new InputValueControl<number>({
        value: 90_000,
        type: 'number',
        label: 'timeoutMs',
        editable: true,
      }),
    })
    // autoDetect (boolean)
    this.addInputPort({
      key: 'autoDetect',
      typeName: 'boolean',
      label: 'autoDetect',
      showControl: false,
      control: new CheckBoxControl({
        value: true,
        label: 'autoDetect',
        editable: true,
      }),
    })
    this.addOutputPort({ key: 'exec', typeName: 'exec', label: 'Out' })
    this.addControl('console', new ConsoleControl({ isOpen: true }))
  }

  async execute(
    _input: 'exec',
    forward: (output: 'exec') => void
  ): Promise<void> {
    if (this.status === NodeStatus.RUNNING) return
    await this.changeStatus(this.area, NodeStatus.RUNNING)
    // gather inputs
    const dfInputs: any = this.dataflow.fetchInputs(this.id)
    const appPath = this.getInputValue<string>(dfInputs, 'appPath')
    const port = this.getInputValue<number>(dfInputs, 'port') ?? 8000
    const timeoutMs =
      this.getInputValue<number>(dfInputs, 'timeoutMs') ?? 90_000
    const autoDetect =
      this.getInputValue<boolean>(dfInputs, 'autoDetect') ?? true
    const opts: LaunchOpts = {
      appPath: appPath || undefined,
      port,
      timeoutMs,
      autoDetect,
    }
    this.controls.console.addValue(
      `[INFO] Launching ComfyUI Desktop (port=${opts.port})`
    )
    try {
      const res = await electronApiService.launchDesktop(opts as any)
      if (res.status === 'success') {
        this.controls.console.addValue(
          `[OK] ComfyUI Desktop ready (port=${res.port})`
        )
        this.setStatus(NodeStatus.COMPLETED)
      } else {
        this.controls.console.addValue(`[ERROR] ${res.message}`)
        this.setStatus(NodeStatus.ERROR)
      }
    } catch (e: any) {
      this.controls.console.addValue(`[EXCEPTION] ${e?.message ?? e}`)
      this.setStatus(NodeStatus.ERROR)
    }
    await this.area.update('node', this.id)
    forward('exec')
  }

  serializeControlValue() {
    return this.controls.console.toJSON()
  }
  deserializeControlValue(data: any) {
    this.controls.console.setFromJSON({ data })
  }
}
