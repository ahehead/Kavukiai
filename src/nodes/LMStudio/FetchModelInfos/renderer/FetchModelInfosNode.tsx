import type { ModelInfo } from '@nodes/LMStudio/common/schema/ModelSchemas'
import { electronApiService } from 'renderer/features/services/appService'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import {
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import { NodeStatus } from 'renderer/nodeEditor/types/Node/BaseNode'
import type { ControlFlowEngine } from 'rete-engine'
import { ModelInfoListControl } from '@nodes/LMStudio/common/renderer/controls/ModelInfoListControl'

export class FetchModelInfosNode extends SerializableInputsNode<
  'FetchModelInfos',
  { exec: TypedSocket; exec2: TypedSocket },
  { modelInfo: TypedSocket },
  { selectList: ModelInfoListControl }
> {
  private models: ModelInfo[] = []
  private selectedKey: string | null = null

  constructor(
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super('FetchModelInfos')
    this.width = 380
    this.height = 380
    this.addInputPort([
      {
        key: 'exec',
        label: 'Fetch',
        onClick: () => this.controlflow.execute(this.id, 'exec'),
      },
      {
        key: 'exec2',
        label: 'Clear',
        onClick: () => this.controlflow.execute(this.id, 'exec2'),
      },
    ])
    this.addOutputPort([
      { key: 'modelInfo', typeName: 'ModelInfoOrNull', label: 'ModelInfo' },
    ])

    this.addControl(
      'selectList',
      new ModelInfoListControl({
        label: 'Models',
        editable: true,
        list: [],
        selectedKey: null,
        onChange: key => {
          this.selectedKey = key
          this.dataflow.reset(this.id)
        },
      })
    )
  }

  data(): { modelInfo: ModelInfo | null } {
    return { modelInfo: this.controls.selectList.getSelected() }
  }

  async execute(
    _input: 'exec' | 'exec2',
    _forward: (output: 'exec') => void
  ): Promise<void> {
    if (this.status === NodeStatus.RUNNING) return
    this.changeStatus(NodeStatus.RUNNING)
    if (_input === 'exec2') {
      this.models = []
      this.selectedKey = null
      this.controls.selectList.setList([])
      this.controls.selectList.setSelectedKey(null)
      this.changeStatus(NodeStatus.IDLE)
      this.dataflow.reset(this.id)
      return
    }
    const result = await electronApiService.listDownloadedModels()
    if (result.status === 'success') {
      this.models = result.data
      this.selectedKey = null
      this.controls.selectList.setList(this.models)
      this.controls.selectList.setSelectedKey(null)
      this.changeStatus(NodeStatus.COMPLETED)
    } else {
      this.models = []
      this.selectedKey = null
      this.controls.selectList.setList([])
      this.controls.selectList.setSelectedKey(null)
      this.changeStatus(NodeStatus.ERROR)
    }
    this.dataflow.reset(this.id)
  }

  serializeControlValue(): {
    data: { list: ModelInfo[]; selectedKey: string | null }
  } {
    return {
      data: {
        list: this.models,
        selectedKey: this.selectedKey,
      },
    }
  }

  deserializeControlValue(data: {
    list: ModelInfo[]
    selectedKey: string | null
  }): void {
    this.models = data.list ?? []
    this.selectedKey = data.selectedKey ?? null
    this.controls.selectList.setList(this.models)
    this.controls.selectList.setSelectedKey(this.selectedKey)
  }
}
